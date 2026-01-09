import express from 'express';
import { body, validationResult } from 'express-validator';
import { verifyToken } from '../middleware/auth.js';
import { db } from '../config/firebase.js';
import { generateNutritionPlan } from '../utils/nutritionPlanner.js';

const router = express.Router();
router.use(verifyToken);

// Generate nutrition plan (Doctor only - for patients)
router.post('/generate', [
  body('condition').isString().trim().notEmpty(),
  body('dietType').isIn(['vegetarian', 'nonVegetarian', 'vegan']),
  body('targetCalories').optional().isInt({ min: 1000, max: 4000 }),
  body('duration').optional().isInt({ min: 7, max: 365 }),
  body('patientId').isString().trim().notEmpty(),
], async (req, res) => {
  try {
    // Only doctors can generate nutrition plans
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ error: 'Only doctors can generate nutrition plans' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { condition, dietType, targetCalories, duration, patientId } = req.body;

    // Verify patient exists
    const patientDoc = await db.collection('users').doc(patientId).get();
    if (!patientDoc.exists || patientDoc.data().role !== 'patient') {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const patientData = patientDoc.data();

    const preferences = {
      targetCalories,
      duration,
      language: patientData.language || 'en',
    };

    const plan = generateNutritionPlan(condition, dietType, preferences);

    // Save to Firestore
    const planRef = await db.collection('nutritionPlans').add({
      patientId: patientId,
      doctorId: req.user.uid,
      ...plan,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    res.json({
      message: 'Nutrition plan generated successfully',
      planId: planRef.id,
      ...plan,
    });
  } catch (error) {
    console.error('Generate nutrition plan error:', error);
    res.status(500).json({ error: 'Error generating nutrition plan' });
  }
});

// Get user's nutrition plans
router.get('/', async (req, res) => {
  try {
    // Ensure user is authenticated
    if (!req.user || !req.user.uid) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userRole = req.user.role || 'patient'; // Default to patient if role not set
    let plansSnapshot;
    
    if (userRole === 'doctor') {
      // Doctors can see all plans they created
      // Try with orderBy first, fallback to without if index doesn't exist
      try {
        plansSnapshot = await db.collection('nutritionPlans')
          .where('doctorId', '==', req.user.uid)
          .orderBy('createdAt', 'desc')
          .get();
      } catch (orderByError) {
        // If orderBy fails (no index), fetch without ordering and sort in memory
        console.warn('OrderBy failed, fetching without order:', orderByError.message);
        plansSnapshot = await db.collection('nutritionPlans')
          .where('doctorId', '==', req.user.uid)
          .get();
      }
    } else {
      // Patients see their own plans
      try {
        plansSnapshot = await db.collection('nutritionPlans')
          .where('patientId', '==', req.user.uid)
          .orderBy('createdAt', 'desc')
          .get();
      } catch (orderByError) {
        // If orderBy fails (no index), fetch without ordering and sort in memory
        console.warn('OrderBy failed, fetching without order:', orderByError.message);
        plansSnapshot = await db.collection('nutritionPlans')
          .where('patientId', '==', req.user.uid)
          .get();
      }
    }

    let plans = plansSnapshot.docs.map(doc => {
      const data = doc.data();
      // Ensure createdAt exists, use document ID timestamp as fallback
      if (!data.createdAt) {
        data.createdAt = new Date().toISOString();
      }
      return {
        id: doc.id,
        ...data,
      };
    });

    // Sort in memory if orderBy wasn't used (fallback) or if createdAt is missing
    plans.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA; // Descending order
    });

    res.json({ plans });
  } catch (error) {
    console.error('Get nutrition plans error:', error);
    // Log full error for debugging
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      user: req.user ? { uid: req.user.uid, role: req.user.role } : 'no user',
    });
    res.status(500).json({ 
      error: 'Error fetching nutrition plans', 
      details: error.message,
      code: error.code 
    });
  }
});

// Get specific nutrition plan
router.get('/:planId', async (req, res) => {
  try {
    const planDoc = await db.collection('nutritionPlans').doc(req.params.planId).get();

    if (!planDoc.exists) {
      return res.status(404).json({ error: 'Nutrition plan not found' });
    }

    const planData = planDoc.data();

    // Verify access
    if (req.user.role === 'patient' && planData.patientId !== req.user.uid) {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (req.user.role === 'doctor' && planData.doctorId !== req.user.uid) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      id: planDoc.id,
      ...planData,
    });
  } catch (error) {
    console.error('Get nutrition plan error:', error);
    res.status(500).json({ error: 'Error fetching nutrition plan' });
  }
});

export default router;

