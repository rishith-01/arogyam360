
import express from 'express';
import multer from 'multer';
import { verifyToken } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';
import { analyzeReportText, getOverallRiskLevel } from '../utils/reportAnalyzer.js';
import pdfParse from 'pdf-parse';

import { db } from '../config/firebase.js';

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

// Upload and analyze medical report
router.post('/upload', upload.single('report'), async (req, res) => {
    try {
        if (req.user.role !== 'doctor' && req.user.role !== 'patient') {
            return res.status(403).json({ error: 'Unauthorized to upload reports' });
        }

        const { reportName, reportType, testDate, patientId } = req.body;
        let targetPatientId = patientId;

        if (req.user.role === 'patient') {
            targetPatientId = req.user.uid;
        } else {
            if (!targetPatientId) {
                return res.status(400).json({ error: 'patientId is required for doctors' });
            }
        }

        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // 1. Upload file to Supabase Storage
        const fileName = `${targetPatientId}/${Date.now()}_${file.originalname}`;
        const { data: storageData, error: storageError } = await supabase.storage
            .from('reports')
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            });

        if (storageError) {
            console.error('Supabase Storage Error:', storageError);
            throw new Error(`Storage upload failed: ${storageError.message}`);
        }

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('reports')
            .getPublicUrl(fileName);

        // 3. Extract Text and Analyze
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

        const biomarkers = analyzeReportText(extractedText);
        const overallRisk = getOverallRiskLevel(biomarkers);

        // 4. Save Metadata to Supabase Database
        const reportData = {
            patient_id: targetPatientId,
            doctor_id: req.user.uid,
            report_name: reportName || file.originalname,
            report_type: reportType || 'general',
            test_date: testDate || new Date().toISOString(),
            file_url: publicUrl,
            file_path: fileName,
            file_type: file.mimetype,
            extracted_text: extractedText,
            biomarkers: biomarkers, // Supabase handles JSONB automatically if column is JSONB
            overall_risk: overallRisk,
            created_at: new Date().toISOString(),
        };

        const { data: dbData, error: dbError } = await supabase
            .from('medical_reports')
            .insert([reportData])
            .select()
            .single();

        if (dbError) {
            console.error('Supabase DB Error:', dbError);
            throw new Error(`Database insert failed: ${dbError.message}`);
        }

        res.json({
            message: 'Report uploaded and analyzed successfully',
            reportId: dbData.id,
            ...dbData,
            // Map back to camelCase for frontend compatibility if needed, but let's stick to returning what we have + mapped
            biomarkers,
            overallRisk
        });

    } catch (error) {
        console.error('Report upload error:', error);
        res.status(500).json({ error: 'Error uploading report', details: error.message });
    }
});

// Get all reports for user
router.get('/', async (req, res) => {
    try {
        if (!req.user || !req.user.uid) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        let query = supabase
            .from('medical_reports')
            .select('*')
            .order('created_at', { ascending: false });

        if (req.user.role === 'doctor') {
            query = query.eq('doctor_id', req.user.uid);
        } else {
            query = query.eq('patient_id', req.user.uid);
        }

        const { data: reports, error } = await query;

        if (error) {
            throw error;
        }

        // Map snake_case to camelCase for frontend compatibility if necessary
        // or frontend can handle it. For now, let's keep it simple.
        // Actually, frontend likely expects camelCase. Let's map it.
        const mappedReports = reports.map(r => ({
            id: r.id,
            patientId: r.patient_id,
            doctorId: r.doctor_id,
            reportName: r.report_name,
            reportType: r.report_type,
            testDate: r.test_date,
            fileUrl: r.file_url,
            fileName: r.file_path, // approximate mapping
            extractedText: r.extracted_text,
            biomarkers: r.biomarkers,
            overallRisk: r.overall_risk,
            createdAt: r.created_at
        }));

        res.json({ reports: mappedReports });
    } catch (error) {
        console.error('Get reports error:', error);
        res.status(500).json({ error: 'Error fetching reports', details: error.message });
    }
});

// Get specific report
router.get('/:reportId', async (req, res) => {
    try {
        const { data: report, error } = await supabase
            .from('medical_reports')
            .select('*')
            .eq('id', req.params.reportId)
            .single();

        if (error || !report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        // Verify access
        if (req.user.role === 'patient' && report.patient_id !== req.user.uid) {
            return res.status(403).json({ error: 'Access denied' });
        }
        if (req.user.role === 'doctor' && report.doctor_id !== req.user.uid) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Map to camelCase
        const mappedReport = {
            id: report.id,
            patientId: report.patient_id,
            doctorId: report.doctor_id,
            reportName: report.report_name,
            reportType: report.report_type,
            testDate: report.test_date,
            fileUrl: report.file_url,
            fileName: report.file_path,
            extractedText: report.extracted_text,
            biomarkers: report.biomarkers,
            overallRisk: report.overall_risk,
            createdAt: report.created_at
        };

        res.json(mappedReport);
    } catch (error) {
        console.error('Get report error:', error);
        res.status(500).json({ error: 'Error fetching report' });
    }
});

export default router;
