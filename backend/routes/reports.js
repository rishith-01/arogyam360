import express from 'express';
import multer from 'multer';
import { verifyToken } from '../middleware/auth.js';
import { db, storage } from '../config/firebase.js';
import { analyzeReportText, getOverallRiskLevel } from '../utils/reportAnalyzer.js';
import pdfParse from 'pdf-parse';
import { Readable } from 'stream';

const router = express.Router();
router.use(verifyToken);

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPG, PNG allowed.'));
    }
  },
});

// Upload and analyze medical report (Doctor only - for patients)
router.post('/upload', upload.single('report'), async (req, res) => {
  try {
    // Allow doctors AND patients to upload reports
    if (req.user.role !== 'doctor' && req.user.role !== 'patient') {
      return res.status(403).json({ error: 'Unauthorized to upload reports' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { reportName, reportType, testDate, patientId } = req.body;

    // For patients, ensure they are uploading for themselves
    let targetPatientId = patientId;
    if (req.user.role === 'patient') {
      targetPatientId = req.user.uid;
    } else {
      // Doctors must provide patientId
      if (!targetPatientId) {
        return res.status(400).json({ error: 'patientId is required for doctors' });
      }
    }

    // Verify patient exists
    const patientDoc = await db.collection('users').doc(targetPatientId).get();
    if (!patientDoc.exists || patientDoc.data().role !== 'patient') {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const file = req.file;
    const fileName = `reports/${targetPatientId}/${Date.now()}_${file.originalname}`;

    // Upload to Firebase Storage
    const bucket = storage.bucket();
    const fileRef = bucket.file(fileName);

    await fileRef.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
      },
    });

    // Make file publicly readable (or use signed URLs in production)
    await fileRef.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    // Extract text from PDF
    let extractedText = '';
    if (file.mimetype === 'application/pdf') {
      try {
        const pdfData = await pdfParse(file.buffer);
        extractedText = pdfData.text;
      } catch (pdfError) {
        console.error('PDF parsing error:', pdfError);
        extractedText = 'Unable to extract text from PDF';
      }
    } else {
      // For images, we'd need OCR. For now, store metadata
      extractedText = 'Image file - OCR analysis pending';
    }

    // Analyze report
    const biomarkers = analyzeReportText(extractedText);
    const overallRisk = getOverallRiskLevel(biomarkers);

    // Save to Firestore
    const reportData = {
      patientId: targetPatientId,
      doctorId: req.user.uid,
      reportName: reportName || file.originalname,
      reportType: reportType || 'general',
      testDate: testDate || new Date().toISOString(),
      fileUrl: publicUrl,
      fileName,
      fileType: file.mimetype,
      extractedText,
      biomarkers,
      overallRisk,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const reportRef = await db.collection('reports').add(reportData);

    res.json({
      message: 'Report uploaded and analyzed successfully',
      reportId: reportRef.id,
      ...reportData,
    });
  } catch (error) {
    console.error('Report upload error:', error);
    res.status(500).json({ error: 'Error uploading report', details: error.message });
  }
});

// Get all reports for user
router.get('/', async (req, res) => {
  try {
    // Ensure user is authenticated
    if (!req.user || !req.user.uid) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userRole = req.user.role || 'patient'; // Default to patient if role not set
    let reportsSnapshot;

    if (userRole === 'doctor') {
      // Doctors can see all reports they created
      // Try with orderBy first, fallback to without if index doesn't exist
      try {
        reportsSnapshot = await db.collection('reports')
          .where('doctorId', '==', req.user.uid)
          .orderBy('createdAt', 'desc')
          .get();
      } catch (orderByError) {
        // If orderBy fails (no index), fetch without ordering and sort in memory
        console.warn('OrderBy failed for doctor reports, fetching without order:', orderByError.message);
        reportsSnapshot = await db.collection('reports')
          .where('doctorId', '==', req.user.uid)
          .get();
      }
    } else {
      // Patients see their own reports
      try {
        reportsSnapshot = await db.collection('reports')
          .where('patientId', '==', req.user.uid)
          .orderBy('createdAt', 'desc')
          .get();
      } catch (orderByError) {
        // If orderBy fails (no index), fetch without ordering and sort in memory
        console.warn('OrderBy failed for patient reports, fetching without order:', orderByError.message);
        reportsSnapshot = await db.collection('reports')
          .where('patientId', '==', req.user.uid)
          .get();
      }
    }

    let reports = reportsSnapshot.docs.map(doc => {
      const data = doc.data();
      // Ensure createdAt exists
      if (!data.createdAt) {
        data.createdAt = new Date().toISOString();
      }
      return {
        id: doc.id,
        ...data,
      };
    });

    // Sort in memory if orderBy wasn't used (fallback)
    reports.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA; // Descending order
    });

    res.json({ reports });
  } catch (error) {
    console.error('Get reports error:', error);
    // Log full error for debugging
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      user: req.user ? { uid: req.user.uid, role: req.user.role } : 'no user',
    });
    res.status(500).json({
      error: 'Error fetching reports',
      details: error.message,
      code: error.code
    });
  }
});

// Get all patients (for doctors to select)
router.get('/patients', async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ error: 'Only doctors can access patient list' });
    }

    const patientsSnapshot = await db.collection('users')
      .where('role', '==', 'patient')
      .get();

    const patients = patientsSnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      email: doc.data().email,
    }));

    res.json({ patients });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ error: 'Error fetching patients' });
  }
});

// Get specific report
router.get('/:reportId', async (req, res) => {
  try {
    const reportDoc = await db.collection('reports').doc(req.params.reportId).get();

    if (!reportDoc.exists) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const reportData = reportDoc.data();

    // Verify access (patient can see their own, doctor can see reports they created)
    if (req.user.role === 'patient' && reportData.patientId !== req.user.uid) {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (req.user.role === 'doctor' && reportData.doctorId !== req.user.uid) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      id: reportDoc.id,
      ...reportData,
    });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ error: 'Error fetching report' });
  }
});

export default router;

