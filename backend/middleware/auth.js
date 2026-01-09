import { auth } from '../config/firebase.js';

export async function verifyToken(req, res, next) {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decodedToken = await auth.verifyIdToken(token);
    
    // Fetch user role
    const { db } = await import('../config/firebase.js');
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.exists ? userDoc.data() : {};
    
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: userData.role || 'patient',
    };
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    if (!res.headersSent) {
      res.status(401).json({ 
        error: 'Invalid or expired token',
        message: error.message 
      });
    }
  }
}

export async function requireRole(role) {
  return async (req, res, next) => {
    try {
      const { db } = await import('../config/firebase.js');
      const userDocRef = db.collection('users').doc(req.user.uid);
      const userDoc = await userDocRef.get();
      
      if (!userDoc.exists) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userData = userDoc.data();
      if (userData.role !== role) {
        return res.status(403).json({ error: `Requires ${role} role` });
      }

      req.user.role = userData.role;
      next();
    } catch (error) {
      console.error('Role verification error:', error);
      res.status(500).json({ error: 'Error verifying role' });
    }
  };
}

