import express from 'express';
import { body, validationResult } from 'express-validator';
import { verifyToken } from '../middleware/auth.js';
import { db } from '../config/firebase.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();

    if (!userDoc.exists) {
      // Auto-create profile if it doesn't exist (self-healing)
      const newProfile = {
        email: req.user.email,
        role: 'patient', // Default role
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await db.collection('users').doc(req.user.uid).set(newProfile);

      return res.json({
        uid: req.user.uid,
        ...newProfile,
      });
    }

    res.json({
      uid: req.user.uid,
      ...userDoc.data(),
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Error fetching profile' });
  }
});

// Create or update user profile
router.post('/profile', [
  body('role').isIn(['patient', 'doctor']).withMessage('Role must be patient or doctor'),
  body('name').optional().isString().trim(),
  body('phone').optional().isString().trim(),
  body('dateOfBirth').optional().isISO8601(),
  body('gender').optional().isIn(['male', 'female', 'other']),
  body('language').optional().isString(),
  body('dietType').optional().isIn(['vegetarian', 'nonVegetarian', 'vegan']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userData = {
      email: req.user.email,
      updatedAt: new Date().toISOString(),
      ...req.body,
    };

    if (!req.body.createdAt) {
      userData.createdAt = new Date().toISOString();
    }

    await db.collection('users').doc(req.user.uid).set(userData, { merge: true });

    res.json({
      message: 'Profile updated successfully',
      uid: req.user.uid,
      ...userData,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Error updating profile' });
  }
});

// Update medical history (for patients)
router.post('/medical-history', [
  body('allergies').optional().isArray(),
  body('medications').optional().isArray(),
  body('conditions').optional().isArray(),
  body('surgeries').optional().isArray(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const medicalHistory = {
      allergies: req.body.allergies || [],
      medications: req.body.medications || [],
      conditions: req.body.conditions || [],
      surgeries: req.body.surgeries || [],
      updatedAt: new Date().toISOString(),
    };

    await db.collection('users').doc(req.user.uid).update({
      medicalHistory,
      updatedAt: new Date().toISOString(),
    });

    res.json({
      message: 'Medical history updated successfully',
      medicalHistory,
    });
  } catch (error) {
    console.error('Update medical history error:', error);
    res.status(500).json({ error: 'Error updating medical history' });
  }
});

// Delete user account
router.delete('/account', async (req, res) => {
  try {
    const userId = req.user.uid;
    const userRole = req.user.role;

    console.log(`Starting account deletion for user: ${userId} (${userRole})`);

    // Delete user's reports
    try {
      let reportsSnapshot;
      if (userRole === 'doctor') {
        reportsSnapshot = await db.collection('reports')
          .where('doctorId', '==', userId)
          .get();
      } else {
        reportsSnapshot = await db.collection('reports')
          .where('patientId', '==', userId)
          .get();
      }

      // Delete report files from storage
      const STORAGE_METHOD = process.env.STORAGE_METHOD || 'local';
      if (STORAGE_METHOD === 'firebase') {
        // Delete from Firebase Storage
        const { storage } = await import('../config/firebase.js');
        const bucket = storage.bucket();
        for (const doc of reportsSnapshot.docs) {
          const reportData = doc.data();
          if (reportData.fileName) {
            try {
              const fileRef = bucket.file(reportData.fileName);
              await fileRef.delete();
            } catch (fileError) {
              console.warn(`Could not delete file ${reportData.fileName}:`, fileError.message);
            }
          }
        }
      } else {
        // Delete local files
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const uploadsDir = path.join(__dirname, '../uploads/reports', userId);
        if (fs.existsSync(uploadsDir)) {
          try {
            fs.rmSync(uploadsDir, { recursive: true, force: true });
            console.log(`Deleted local report files for user ${userId}`);
          } catch (fileError) {
            console.warn(`Could not delete local files:`, fileError.message);
          }
        }
      }

      // Delete report documents from Firestore
      const reportBatch = db.batch();
      reportsSnapshot.docs.forEach((doc) => {
        reportBatch.delete(doc.ref);
      });
      if (reportsSnapshot.docs.length > 0) {
        await reportBatch.commit();
        console.log(`Deleted ${reportsSnapshot.docs.length} reports`);
      }
    } catch (error) {
      console.error('Error deleting reports:', error);
      // Continue with deletion even if reports deletion fails
    }

    // Delete user's consultations
    try {
      let consultationsSnapshot;
      if (userRole === 'doctor') {
        consultationsSnapshot = await db.collection('consultations')
          .where('doctorId', '==', userId)
          .get();
      } else {
        consultationsSnapshot = await db.collection('consultations')
          .where('patientId', '==', userId)
          .get();
      }

      const consultationBatch = db.batch();
      consultationsSnapshot.docs.forEach((doc) => {
        consultationBatch.delete(doc.ref);
      });
      if (consultationsSnapshot.docs.length > 0) {
        await consultationBatch.commit();
        console.log(`Deleted ${consultationsSnapshot.docs.length} consultations`);
      }
    } catch (error) {
      console.error('Error deleting consultations:', error);
      // Continue with deletion even if consultations deletion fails
    }

    // Delete user's nutrition plans
    try {
      let plansSnapshot;
      if (userRole === 'doctor') {
        plansSnapshot = await db.collection('nutritionPlans')
          .where('doctorId', '==', userId)
          .get();
      } else {
        plansSnapshot = await db.collection('nutritionPlans')
          .where('patientId', '==', userId)
          .get();
      }

      const planBatch = db.batch();
      plansSnapshot.docs.forEach((doc) => {
        planBatch.delete(doc.ref);
      });
      if (plansSnapshot.docs.length > 0) {
        await planBatch.commit();
        console.log(`Deleted ${plansSnapshot.docs.length} nutrition plans`);
      }
    } catch (error) {
      console.error('Error deleting nutrition plans:', error);
      // Continue with deletion even if plans deletion fails
    }

    // Delete user's medication history
    try {
      const medicationsSnapshot = await db.collection('medications')
        .where('userId', '==', userId)
        .get();

      const medicationBatch = db.batch();
      medicationsSnapshot.docs.forEach((doc) => {
        medicationBatch.delete(doc.ref);
      });
      if (medicationsSnapshot.docs.length > 0) {
        await medicationBatch.commit();
        console.log(`Deleted ${medicationsSnapshot.docs.length} medication records`);
      }
    } catch (error) {
      console.error('Error deleting medications:', error);
      // Continue with deletion even if medications deletion fails
    }

    // Delete user profile from Firestore
    try {
      await db.collection('users').doc(userId).delete();
      console.log('Deleted user profile from Firestore');
    } catch (error) {
      console.error('Error deleting user profile:', error);
      // Continue with deletion even if profile deletion fails
    }

    // Delete user from Firebase Auth
    try {
      const { auth } = await import('../config/firebase.js');
      await auth.getUser(userId);
      await auth.deleteUser(userId);
      console.log('Deleted user from Firebase Auth');
    } catch (error) {
      console.error('Error deleting user from Firebase Auth:', error);
      // If user doesn't exist in Auth, that's okay - continue
    }

    res.json({
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      error: 'Error deleting account',
      details: error.message
    });
  }
});

export default router;

