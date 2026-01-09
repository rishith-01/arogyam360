import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { verifyToken } from '../middleware/auth.js';
import { db } from '../config/firebase.js'; // Keep using Firestore for metadata
import { analyzeReportText, getOverallRiskLevel } from '../utils/reportAnalyzer.js';
import pdfParse from 'pdf-parse';

const router = express.Router();

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'arogyam360/reports',
        allowed_formats: ['jpg', 'png', 'pdf'],
        public_id: (req, file) => `${Date.now()}_${file.originalname.replace(/\.[^/.]+$/, "")}`, // Remove extension for public_id
    },
});

// Memory storage for PDF parsing (intermediate step)
// Since we need to parse the PDF text, we can't stream directly to Cloudinary AND parse efficiently without complexity.
// Strategy: Upload to Cloudinary implies we might lose the stream. 
// A simpler "Free" approach for this MVP: 
// 1. Use MemoryStorage to get the buffer.
// 2. Parse PDF from buffer.
// 3. Upload buffer to Cloudinary using upload_stream.

const memoryUpload = multer({
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

router.use(verifyToken);

// Helper to stream buffer to Cloudinary
const streamUpload = (buffer, mimetype) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: 'arogyam360/reports',
                resource_type: 'auto', // Auto-detect (image or raw/pdf)
            },
            (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
            }
        );
        stream.end(buffer);
    });
};

router.post('/upload', memoryUpload.single('report'), async (req, res) => {
    try {
        // Permission Check (Same as reports.js)
        if (req.user.role !== 'doctor' && req.user.role !== 'patient') {
            return res.status(403).json({ error: 'Unauthorized to upload reports' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { reportName, reportType, testDate, patientId } = req.body;

        // Target Patient Logic
        let targetPatientId = patientId;
        if (req.user.role === 'patient') {
            targetPatientId = req.user.uid;
        } else {
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

        // 1. Parse Text (if PDF)
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
            extractedText = 'Image file - OCR analysis pending';
        }

        // 2. Upload to Cloudinary
        const cloudinaryResult = await streamUpload(file.buffer, file.mimetype);

        // Analyze report
        const biomarkers = analyzeReportText(extractedText);
        const overallRisk = getOverallRiskLevel(biomarkers);

        // Save to Firestore (Metadata only)
        const reportData = {
            patientId: targetPatientId,
            doctorId: req.user.uid,
            reportName: reportName || file.originalname,
            reportType: reportType || 'general',
            testDate: testDate || new Date().toISOString(),
            fileUrl: cloudinaryResult.secure_url, // Cloudinary URL
            fileName: cloudinaryResult.public_id, // Cloudinary Public ID
            fileType: file.mimetype,
            storageProvider: 'cloudinary',
            extractedText,
            biomarkers,
            overallRisk,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const reportRef = await db.collection('reports').add(reportData);

        res.json({
            message: 'Report uploaded and analyzed successfully (Cloudinary)',
            reportId: reportRef.id,
            ...reportData,
        });

    } catch (error) {
        console.error('Cloudinary Upload Error:', error);
        res.status(500).json({ error: 'Error uploading report', details: error.message });
    }
});

// Get reports (READ only - similar to others)
router.get('/', async (req, res) => {
    // Reuse the same verify/fetch logic from reports.js
    // Since reading just depends on Firestore metadata, we can actually reuse the same logic.
    // I'll copy the GET logic from reports.js here for completeness.

    try {
        if (!req.user || !req.user.uid) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const userRole = req.user.role || 'patient';
        let reportsSnapshot;

        if (userRole === 'doctor') {
            reportsSnapshot = await db.collection('reports')
                .where('doctorId', '==', req.user.uid)
                .get();
            // Simplified for brevity, sorting usually happens client side or memory if small
        } else {
            reportsSnapshot = await db.collection('reports')
                .where('patientId', '==', req.user.uid)
                .get();
        }

        let reports = reportsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Manual sort desc
        reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({ reports });

    } catch (error) {
        console.error('Get reports error:', error);
        res.status(500).json({ error: 'Error fetching reports' });
    }
});

router.get('/:reportId', async (req, res) => {
    try {
        const reportDoc = await db.collection('reports').doc(req.params.reportId).get();
        if (!reportDoc.exists) return res.status(404).json({ error: 'Report not found' });
        const data = reportDoc.data();
        if (req.user.role === 'patient' && data.patientId !== req.user.uid) return res.status(403).json({ error: 'Access denied' });

        res.json({ id: reportDoc.id, ...data });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching report' });
    }
});

// Get patients for doctors
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

export default router;
