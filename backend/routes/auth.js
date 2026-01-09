import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { db } from '../config/firebase.js';

const router = express.Router();

// Verify token and get user info
router.get('/verify', verifyToken, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    res.json({
      uid: req.user.uid,
      email: req.user.email,
      ...userDoc.data(),
    });
  } catch (error) {
    console.error('Auth verify error:', error);
    res.status(500).json({ error: 'Error verifying authentication' });
  }
});

export default router;


