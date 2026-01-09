import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { initializeFirebase } from './config/firebase.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import medicationRoutes from './routes/medications.js';
import nutritionRoutes from './routes/nutrition.js';
import consultationRoutes from './routes/consultations.js';
import chatbotRoutes from './routes/chatbot.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Choose storage method: 'firebase' or 'local'
const STORAGE_METHOD = process.env.STORAGE_METHOD || 'local'; // Default to local

// Dynamically import report routes based on storage method
let reportRoutes;
if (STORAGE_METHOD === 'local') {
  const localReports = await import('./routes/reports-local.js');
  reportRoutes = localReports.default;
  console.log('📁 Using LOCAL file storage (no Firebase Storage needed)');
} else if (STORAGE_METHOD === 'supabase') {
  const supabaseReports = await import('./routes/reports-supabase.js');
  reportRoutes = supabaseReports.default;
  console.log('⚡ Using SUPABASE Storage and Database');
} else if (STORAGE_METHOD === 'cloudinary') {
  const cloudinaryReports = await import('./routes/reports-cloudinary.js');
  reportRoutes = cloudinaryReports.default;
  console.log('☁️ Using CLOUDINARY Storage');
} else {
  reportRoutes = (await import('./routes/reports.js')).default;
  console.log('☁️ Using FIREBASE Storage');
}

// Initialize Firebase Admin
initializeFirebase();

// Request logger for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false, // Disable CSP in dev to avoid blocking
}));

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked for origin: ${origin}`);
      callback(null, true); // Still allow in development to avoid blocking
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable pre-flight for all routes

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  // Don't send response if headers already sent
  if (res.headersSent) {
    return next(err);
  }

  console.error('🚨 Express Error Middleware:', err);
  console.error('   Error name:', err?.name);
  console.error('   Error message:', err?.message);
  console.error('   Error status:', err?.status);
  console.error('   Route:', req.path);

  const status = err.status || err.statusCode || 500;
  const errorMessage = err.message || 'Internal server error';

  res.status(status).json({
    error: errorMessage,
    response: 'I apologize, but I encountered an error processing your request. Please try again or contact support if the issue persists.',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err.toString()
    })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
});

