import express from 'express';
import { body, validationResult } from 'express-validator';
import { verifyToken } from '../middleware/auth.js';
import { db } from '../config/firebase.js';
import { checkDrugInteractions, getInteractionRecommendations } from '../utils/drugInteractions.js';

const router = express.Router();
router.use(verifyToken);

// Save medications for patient (Doctor only)
router.post('/save-for-patient', [
  body('patientId').isString().trim().notEmpty(),
  body('medications').isArray().withMessage('Medications must be an array'),
], async (req, res) => {
  try {
    // Only doctors can save medications for patients
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ error: 'Only doctors can add medications for patients' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { patientId, medications } = req.body;

    // Verify patient exists
    const patientDoc = await db.collection('users').doc(patientId).get();
    if (!patientDoc.exists || patientDoc.data().role !== 'patient') {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Update patient's medical history
    await db.collection('users').doc(patientId).update({
      'medicalHistory.medications': medications,
      updatedAt: new Date().toISOString(),
    });

    // Check interactions
    const interactionResult = checkDrugInteractions(medications);
    const recommendations = getInteractionRecommendations(interactionResult.interactions);

    res.json({
      message: 'Medications saved successfully',
      medications,
      interactionResult,
      recommendations,
    });
  } catch (error) {
    console.error('Save medications error:', error);
    res.status(500).json({ error: 'Error saving medications' });
  }
});

// Check drug interactions (for viewing only)
router.post('/check-interactions', [
  body('medications').isArray().withMessage('Medications must be an array'),
  body('medications.*').isString().trim().notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { medications } = req.body;

    if (medications.length < 2) {
      return res.status(400).json({ error: 'Need at least 2 medications to check interactions' });
    }

    const interactionResult = checkDrugInteractions(medications);
    const recommendations = getInteractionRecommendations(interactionResult.interactions);

    // Save interaction check (read-only, for reference)
    await db.collection('medications').add({
      userId: req.user.uid,
      medications,
      interactionResult,
      recommendations,
      checkedAt: new Date().toISOString(),
    });

    res.json({
      medications,
      ...interactionResult,
      recommendations,
    });
  } catch (error) {
    console.error('Check interactions error:', error);
    res.status(500).json({ error: 'Error checking drug interactions' });
  }
});

// Get patient medications (for doctors)
router.get('/patient/:patientId', async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ error: 'Only doctors can view patient medications' });
    }

    const patientDoc = await db.collection('users').doc(req.params.patientId).get();
    if (!patientDoc.exists) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const medications = patientDoc.data().medicalHistory?.medications || [];

    res.json({ medications });
  } catch (error) {
    console.error('Get patient medications error:', error);
    res.status(500).json({ error: 'Error fetching patient medications' });
  }
});

// Get user's medication history
router.get('/history', async (req, res) => {
  try {
    const medicationsSnapshot = await db.collection('medications')
      .where('userId', '==', req.user.uid)
      .orderBy('checkedAt', 'desc')
      .limit(10)
      .get();

    const history = medicationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ history });
  } catch (error) {
    console.error('Get medication history error:', error);
    res.status(500).json({ error: 'Error fetching medication history' });
  }
});

export default router;

