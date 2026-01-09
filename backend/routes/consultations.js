import express from 'express';
import { body, validationResult } from 'express-validator';
import { verifyToken } from '../middleware/auth.js';
import { db } from '../config/firebase.js';

const router = express.Router();
router.use(verifyToken);

// Book consultation (Patient only)
router.post('/book', [
  body('doctorId').isString().trim().notEmpty(),
  body('dateTime').isISO8601(),
  body('reason').optional().isString().trim(),
  body('symptoms').optional().isArray(),
], async (req, res) => {
  try {
    // Only patients can book consultations
    if (req.user.role !== 'patient') {
      return res.status(403).json({ error: 'Only patients can book consultations' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { doctorId, dateTime, reason, symptoms } = req.body;

    // Verify doctor exists
    const doctorDoc = await db.collection('users').doc(doctorId).get();
    if (!doctorDoc.exists || doctorDoc.data().role !== 'doctor') {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Generate Jitsi meeting room ID
    const meetingRoomId = `consultation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const consultationData = {
      patientId: req.user.uid,
      doctorId,
      dateTime,
      reason: reason || 'General consultation',
      symptoms: symptoms || [],
      status: 'pending', // Changed to pending - doctor needs to accept
      meetingRoomId,
      meetingUrl: `https://meet.jit.si/${meetingRoomId}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const consultationRef = await db.collection('consultations').add(consultationData);

    res.json({
      message: 'Consultation booked successfully',
      consultationId: consultationRef.id,
      ...consultationData,
    });
  } catch (error) {
    console.error('Book consultation error:', error);
    res.status(500).json({ error: 'Error booking consultation' });
  }
});

// Get all doctors (for patients to select when booking)
router.get('/doctors', async (req, res) => {
  try {
    // Allow any authenticated user to see the doctor list
    // (removed strict patient check to avoid 403s if role sync is delayed)
    console.log(`Fetching doctors list for user: ${req.user.uid} (${req.user.role})`);

    const doctorsSnapshot = await db.collection('users')
      .where('role', '==', 'doctor')
      .get();

    const doctors = doctorsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || 'Dr. ' + (data.email?.split('@')[0] || 'Unknown'),
        email: data.email,
        specialty: data.specialty || 'General Medicine',
      };
    });

    res.json({ doctors });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ error: 'Error fetching doctors' });
  }
});

// Get user's consultations
router.get('/', async (req, res) => {
  try {
    // Ensure user is authenticated
    if (!req.user || !req.user.uid) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userRole = req.user.role || 'patient'; // Use role from middleware
    let consultationsSnapshot;

    if (userRole === 'doctor') {
      // Doctors can see all consultations assigned to them
      // Try with orderBy first, fallback to without if index doesn't exist
      try {
        consultationsSnapshot = await db.collection('consultations')
          .where('doctorId', '==', req.user.uid)
          .orderBy('dateTime', 'desc')
          .get();
      } catch (orderByError) {
        // If orderBy fails (no index), fetch without ordering and sort in memory
        console.warn('OrderBy failed for doctor consultations, fetching without order:', orderByError.message);
        consultationsSnapshot = await db.collection('consultations')
          .where('doctorId', '==', req.user.uid)
          .get();
      }
    } else {
      // Patients see their own consultations
      try {
        consultationsSnapshot = await db.collection('consultations')
          .where('patientId', '==', req.user.uid)
          .orderBy('dateTime', 'desc')
          .get();
      } catch (orderByError) {
        // If orderBy fails (no index), fetch without ordering and sort in memory
        console.warn('OrderBy failed for patient consultations, fetching without order:', orderByError.message);
        consultationsSnapshot = await db.collection('consultations')
          .where('patientId', '==', req.user.uid)
          .get();
      }
    }

    let consultations = consultationsSnapshot.docs.map(doc => {
      const data = doc.data();
      // Ensure dateTime exists for sorting
      if (!data.dateTime) {
        data.dateTime = data.createdAt || new Date().toISOString();
      }
      return {
        id: doc.id,
        ...data,
      };
    });

    // Sort in memory if orderBy wasn't used (fallback)
    consultations.sort((a, b) => {
      const dateA = a.dateTime ? new Date(a.dateTime).getTime() : 0;
      const dateB = b.dateTime ? new Date(b.dateTime).getTime() : 0;
      return dateB - dateA; // Descending order
    });

    res.json({ consultations });
  } catch (error) {
    console.error('Get consultations error:', error);
    // Log full error for debugging
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      user: req.user ? { uid: req.user.uid, role: req.user.role } : 'no user',
    });
    res.status(500).json({
      error: 'Error fetching consultations',
      details: error.message,
      code: error.code
    });
  }
});

// Get specific consultation
router.get('/:consultationId', async (req, res) => {
  try {
    const consultationDoc = await db.collection('consultations').doc(req.params.consultationId).get();

    if (!consultationDoc.exists) {
      return res.status(404).json({ error: 'Consultation not found' });
    }

    const consultationData = consultationDoc.data();

    // Verify access
    if (consultationData.patientId !== req.user.uid && consultationData.doctorId !== req.user.uid) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      id: consultationDoc.id,
      ...consultationData,
    });
  } catch (error) {
    console.error('Get consultation error:', error);
    res.status(500).json({ error: 'Error fetching consultation' });
  }
});

// Accept consultation (Doctor only)
router.post('/:consultationId/accept', async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ error: 'Only doctors can accept consultations' });
    }

    const consultationDoc = await db.collection('consultations').doc(req.params.consultationId).get();

    if (!consultationDoc.exists) {
      return res.status(404).json({ error: 'Consultation not found' });
    }

    const consultationData = consultationDoc.data();

    if (consultationData.doctorId !== req.user.uid) {
      return res.status(403).json({ error: 'You can only accept consultations assigned to you' });
    }

    await db.collection('consultations').doc(req.params.consultationId).update({
      status: 'scheduled',
      updatedAt: new Date().toISOString(),
    });

    res.json({
      message: 'Consultation accepted successfully',
      consultationId: req.params.consultationId,
    });
  } catch (error) {
    console.error('Accept consultation error:', error);
    res.status(500).json({ error: 'Error accepting consultation' });
  }
});

// Update consultation (add notes, prescription, etc.) - Doctor only
router.patch('/:consultationId', [
  body('notes').optional().isString(),
  body('prescription').optional().isArray(),
  body('status').optional().isIn(['pending', 'scheduled', 'completed', 'cancelled']),
], async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ error: 'Only doctors can update consultation details' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const consultationDoc = await db.collection('consultations').doc(req.params.consultationId).get();

    if (!consultationDoc.exists) {
      return res.status(404).json({ error: 'Consultation not found' });
    }

    const consultationData = consultationDoc.data();

    if (consultationData.doctorId !== req.user.uid) {
      return res.status(403).json({ error: 'You can only update consultations assigned to you' });
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    await db.collection('consultations').doc(req.params.consultationId).update(updateData);

    res.json({
      message: 'Consultation updated successfully',
      consultationId: req.params.consultationId,
      ...updateData,
    });
  } catch (error) {
    console.error('Update consultation error:', error);
    res.status(500).json({ error: 'Error updating consultation' });
  }
});

export default router;

