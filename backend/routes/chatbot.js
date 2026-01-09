import express from 'express';
import { body, validationResult } from 'express-validator';
import { verifyToken } from '../middleware/auth.js';
import { db } from '../config/firebase.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

// Wrap verifyToken to handle async errors
router.use((req, res, next) => {
  verifyToken(req, res, next).catch((error) => {
    console.error('❌ Auth middleware error:', error);
    if (!res.headersSent) {
      res.status(401).json({
        error: 'Authentication failed',
        message: error.message
      });
    }
  });
});

// Initialize Gemini AI only if API key is provided
let genAI = null;

// Debug: Check if env var is loaded
const rawKey = process.env.GEMINI_API_KEY;
if (rawKey) {
  console.log('🔍 Found GEMINI_API_KEY in environment');
  console.log('   Raw length:', rawKey.length);
}

// Clean the API key - remove all whitespace including line breaks
const apiKey = rawKey?.trim().replace(/\s+/g, '');

if (apiKey && apiKey.length > 10) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    console.log('✅ Gemini AI initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing Gemini AI:', error.message);
    console.warn('⚠️  Chatbot feature will be disabled.');
  }
} else {
  console.warn('⚠️  GEMINI_API_KEY not set or invalid. Chatbot feature will be disabled.');
  if (rawKey) {
    console.warn(`   Found GEMINI_API_KEY but it appears invalid (length: ${rawKey?.length || 0}, cleaned: ${apiKey?.length || 0})`);
  } else {
    console.warn('   GEMINI_API_KEY environment variable not found.');
  }
}

// Medical chatbot endpoint
router.post('/chat', [
  body('message').isString().trim().notEmpty().withMessage('Message is required'),
  body('context').optional().isObject(),
], async (req, res, next) => {
  console.log('📨 Chatbot request received');
  console.log('   User:', req.user ? { uid: req.user.uid, role: req.user.role } : 'no user');
  console.log('   Message:', req.body?.message?.substring(0, 50) + '...');
  console.log('   Gemini AI initialized:', !!genAI);

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('❌ Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if Gemini is configured
    if (!genAI) {
      return res.status(503).json({
        error: 'Chatbot service is not available. Please configure GEMINI_API_KEY in backend/.env file.',
        response: 'I apologize, but the chatbot service is currently unavailable. Please contact support or configure the Gemini API key to enable this feature.'
      });
    }

    // Validate user
    if (!req.user || !req.user.uid) {
      console.error('❌ No user found in request');
      return res.status(401).json({
        error: 'User not authenticated',
        response: 'Please log in to use the chatbot.'
      });
    }

    const { message, context } = req.body;

    // Fetch user context from Firestore
    let userData = {};
    try {
      const userDoc = await db.collection('users').doc(req.user.uid).get();
      userData = userDoc.exists ? userDoc.data() : {};
    } catch (userError) {
      console.error('❌ Error fetching user data:', userError.message);
      // Continue with empty userData
    }

    // Fetch recent reports
    let recentReports = [];
    try {
      let reportsSnapshot;
      try {
        reportsSnapshot = await db.collection('reports')
          .where('patientId', '==', req.user.uid)
          .orderBy('createdAt', 'desc')
          .limit(3)
          .get();
      } catch (orderByError) {
        // Fallback without orderBy
        reportsSnapshot = await db.collection('reports')
          .where('patientId', '==', req.user.uid)
          .limit(3)
          .get();
      }
      recentReports = reportsSnapshot.docs.map(doc => doc.data());
      // Sort in memory if needed
      recentReports.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    } catch (reportsError) {
      console.error('❌ Error fetching reports:', reportsError.message);
      // Continue with empty reports array
    }

    // Fetch medications
    const medications = userData?.medicalHistory?.medications || [];

    // Fetch recent consultations
    let recentConsultations = [];
    try {
      let consultationsSnapshot;
      try {
        consultationsSnapshot = await db.collection('consultations')
          .where('patientId', '==', req.user.uid)
          .orderBy('dateTime', 'desc')
          .limit(2)
          .get();
      } catch (orderByError) {
        // Fallback without orderBy
        consultationsSnapshot = await db.collection('consultations')
          .where('patientId', '==', req.user.uid)
          .limit(2)
          .get();
      }
      recentConsultations = consultationsSnapshot.docs.map(doc => doc.data());
      // Sort in memory if needed
      recentConsultations.sort((a, b) => {
        const dateA = a.dateTime ? new Date(a.dateTime).getTime() : 0;
        const dateB = b.dateTime ? new Date(b.dateTime).getTime() : 0;
        return dateB - dateA;
      });
    } catch (consultationsError) {
      console.error('❌ Error fetching consultations:', consultationsError.message);
      // Continue with empty consultations array
    }

    // Build context for chatbot
    let systemContext;
    try {
      systemContext = buildSystemContext(userData, recentReports, medications, recentConsultations);
    } catch (contextError) {
      console.error('❌ Error building system context:', contextError.message);
      // Use a basic context if building fails
      systemContext = `You are Arogyam-360, a helpful medical assistant for an Indian healthcare platform. 
You provide informational guidance only - you do NOT diagnose, prescribe, or make medical decisions.
Always remind users to consult qualified healthcare providers for medical decisions.`;
    }

    // Call Gemini AI API
    let response;
    try {
      console.log('🤖 Calling Gemini AI API...');
      let modelId = 'gemini-2.0-flash';
      let model;

      try {
        model = genAI.getGenerativeModel({
          model: modelId,
          systemInstruction: systemContext,
        });
        const result = await model.generateContent(message);
        if (result.response) {
          response = result.response.text();
          console.log(`✅ Gemini AI API responded successfully using ${modelId}`);
        }
      } catch (firstError) {
        console.warn(`⚠️  Failed to use ${modelId}, trying fallback:`, firstError.message);
        modelId = 'gemini-flash-latest';
        model = genAI.getGenerativeModel({
          model: modelId,
          systemInstruction: systemContext,
        });
        const result = await model.generateContent(message);
        if (result.response) {
          response = result.response.text();
          console.log(`✅ Gemini AI API responded successfully using fallback ${modelId}`);
        }
      }

      if (!response) {
        throw new Error('No response from Gemini API after fallback');
      }
    } catch (geminiError) {
      console.error('❌ Gemini AI API error details:', geminiError);
      const errMsg = geminiError.message || '';

      // Handle specific Gemini errors
      if (errMsg.includes('429') || errMsg.includes('quota')) {
        throw new Error('QUOTA_EXCEEDED: Your Gemini API quota has been exceeded. Please check your Google AI Studio account.');
      }

      if (errMsg.includes('401') || errMsg.includes('API key not valid') || errMsg.includes('403')) {
        throw new Error('INVALID_API_KEY: The Gemini API key is invalid or expired. Please check your GEMINI_API_KEY in the backend/.env file.');
      }

      throw new Error(`AI Service Error: ${errMsg || 'Unknown Gemini error'}`);
    }

    // Save chat history
    try {
      await db.collection('chatHistory').add({
        userId: req.user.uid,
        message,
        response,
        context: systemContext,
        createdAt: new Date().toISOString(),
      });
      console.log('💾 Chat history saved');
    } catch (dbError) {
      console.error('❌ Firestore Save Error:', dbError.message);
    }

    console.log('✅ Sending successful response');
    res.json({
      response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('🚨 Chatbot Route Global Error:', error);

    if (res.headersSent) {
      console.error('⚠️ Response already sent, cannot send error response');
      return;
    }

    // Determine user-friendly error message based on error type
    let userMessage = 'I apologize, but I encountered an error processing your message. Please try again or contact support if the issue persists.';
    let statusCode = 500;

    if (error.message.includes('QUOTA_EXCEEDED')) {
      userMessage = 'I apologize, but the AI service has reached its usage limit. Please wait a moment or check your API configuration.';
      statusCode = 503;
    } else if (error.message.includes('INVALID_API_KEY')) {
      userMessage = 'I apologize, but the AI service is not properly configured. Please contact the administrator.';
      statusCode = 503;
    }

    res.status(statusCode).json({
      error: 'Error processing chat message',
      details: error.message,
      response: userMessage,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
});

// Get chat history
router.get('/history', async (req, res) => {
  try {
    // Ensure user is authenticated
    if (!req.user || !req.user.uid) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    let historySnapshot;

    // Try with orderBy first, fallback to without if index doesn't exist
    try {
      historySnapshot = await db.collection('chatHistory')
        .where('userId', '==', req.user.uid)
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();
    } catch (orderByError) {
      // If orderBy fails (no index), fetch without ordering and sort in memory
      console.warn('OrderBy failed for chat history, fetching without order:', orderByError.message);
      historySnapshot = await db.collection('chatHistory')
        .where('userId', '==', req.user.uid)
        .limit(50)
        .get();
    }

    let history = historySnapshot.docs.map(doc => {
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
    history.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA; // Descending order
    });

    res.json({ history });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      error: 'Error fetching chat history',
      details: error.message,
      code: error.code
    });
  }
});

function buildSystemContext(userData, reports, medications, consultations) {
  try {
    // Ensure all inputs are safe
    const safeUserData = userData || {};
    const safeReports = Array.isArray(reports) ? reports : [];
    const safeMedications = Array.isArray(medications) ? medications : [];
    const safeConsultations = Array.isArray(consultations) ? consultations : [];

    let context = `You are Arogyam-360, a helpful medical assistant for an Indian healthcare platform. 
You provide informational guidance only - you do NOT diagnose, prescribe, or make medical decisions.
Always remind users to consult qualified healthcare providers for medical decisions.

IMPORTANT DISCLAIMERS:
- This is informational assistance only
- Not a substitute for professional medical advice
- Always consult doctors for medical decisions
- In emergencies, contact emergency services immediately

User Profile:
- Name: ${safeUserData.name || 'User'}
- Age: ${safeUserData.dateOfBirth ? calculateAge(safeUserData.dateOfBirth) : 'Not provided'}
- Gender: ${safeUserData.gender || 'Not provided'}
- Diet Type: ${safeUserData.dietType || 'Not specified'}
- Language Preference: ${safeUserData.language || 'English'}
`;

    if (safeMedications.length > 0) {
      const medList = safeMedications.filter(m => m && typeof m === 'string').join(', ');
      if (medList) {
        context += `\nCurrent Medications: ${medList}`;
      }
    }

    if (safeReports.length > 0) {
      context += `\nRecent Medical Reports:\n`;
      safeReports.forEach((report, idx) => {
        if (!report) return;
        const reportName = report.reportName || 'Unnamed Report';
        const testDate = report.testDate || 'Date not available';
        context += `Report ${idx + 1}: ${reportName} (${testDate})\n`;
        if (report.biomarkers && Array.isArray(report.biomarkers) && report.biomarkers.length > 0) {
          const findings = report.biomarkers.slice(0, 3)
            .filter(b => b && b.displayName)
            .map(b => {
              const name = b.displayName || 'Unknown';
              const value = b.value || 'N/A';
              const unit = b.unit || '';
              const risk = b.riskLevel || 'Unknown';
              return `${name}: ${value}${unit ? ' ' + unit : ''} (${risk})`;
            })
            .join(', ');
          if (findings) {
            context += `Key Findings: ${findings}\n`;
          }
        }
      });
    }

    if (safeConsultations.length > 0) {
      context += `\nRecent Consultations:\n`;
      safeConsultations.forEach((consult, idx) => {
        if (!consult) return;
        const reason = consult.reason || 'General consultation';
        const dateTime = consult.dateTime || 'Date not available';
        context += `Consultation ${idx + 1}: ${reason} on ${dateTime}\n`;
        if (consult.notes && typeof consult.notes === 'string') {
          const notes = consult.notes.substring(0, 200);
          if (notes) {
            context += `Doctor Notes: ${notes}\n`;
          }
        }
      });
    }

    context += `\n\nGuidelines:
- Explain medical terms in simple language (${safeUserData.language || 'English'})
- Provide Indian diet context when discussing nutrition
- Reference user's medical history when relevant
- Suggest consulting doctors for serious concerns
- Be empathetic and supportive
- Use Indian healthcare context (medicines, practices, etc.)`;

    return context;
  } catch (error) {
    console.error('Error in buildSystemContext:', error);
    return `You are Arogyam-360, a helpful medical assistant for an Indian healthcare platform. 
You provide informational guidance only - you do NOT diagnose, prescribe, or make medical decisions.
Always remind users to consult qualified healthcare providers for medical decisions.`;
  }
}

function calculateAge(dateOfBirth) {
  try {
    if (!dateOfBirth) return 'Not provided';
    const birthDate = new Date(dateOfBirth);
    if (isNaN(birthDate.getTime())) {
      return 'Invalid date';
    }
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  } catch (error) {
    console.error('Error calculating age:', error);
    return 'Not provided';
  }
}

export default router;

