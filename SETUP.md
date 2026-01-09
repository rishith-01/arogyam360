# Arogyam-360 Setup Guide

## Prerequisites

1. **Node.js** 18+ installed
2. **Firebase Project** with:
   - Authentication enabled (Email/Password)
   - Firestore Database
   - Firebase Storage
   - Service Account key (for backend)
3. **Gemini API Key** (for chatbot)

## Step 1: Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Enable **Authentication** → Email/Password provider
4. Create **Firestore Database** (start in production mode)
5. Enable **Storage**
6. Go to Project Settings → Service Accounts
7. Generate new private key (save as JSON)
8. Copy the following from Firebase Console → Project Settings → General:
   - API Key
   - Auth Domain
   - Project ID
   - Storage Bucket
   - Messaging Sender ID
   - App ID

## Step 2: Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

## Step 3: Configure Environment Variables

### Frontend (`frontend/.env.local`)

Create `frontend/.env.local` with:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Backend (`backend/.env`)

Create `backend/.env` with:

```env
PORT=3001
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email@your_project_id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:3000
```

**Important**: For `FIREBASE_PRIVATE_KEY`, copy the entire private key from the service account JSON file, including the `\n` characters. Keep it in quotes.

## Step 4: Deploy Firestore Security Rules

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init firestore`
4. Deploy rules: `firebase deploy --only firestore:rules`

Or manually copy `firestore.rules` content to Firebase Console → Firestore → Rules

## Step 5: Run the Application

### Development Mode

From root directory:
```bash
npm run dev
```

This starts both frontend (port 3000) and backend (port 3001).

Or run separately:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Production Build

```bash
# Build frontend
cd frontend
npm run build
npm start

# Build backend
cd backend
npm start
```

## Step 6: Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Features Overview

1. **Authentication**: Sign up/Sign in with email/password
2. **Medical Reports**: Upload PDF/JPG/PNG reports, automatic analysis
3. **Drug Interactions**: Check medication interactions
4. **Nutrition Plans**: Generate personalized Indian diet plans
5. **Consultations**: Book doctor consultations with Jitsi video calls
6. **Medical Chatbot**: AI-powered health assistant (Google Gemini AI)

## Troubleshooting

### Firebase Connection Issues
- Verify all environment variables are correct
- Check Firebase project settings
- Ensure service account has proper permissions

### Backend Not Starting
- Check if port 3001 is available
- Verify Firebase credentials in `.env`
- Check Gemini API key is valid

### Frontend Build Errors
- Clear `.next` folder: `rm -rf frontend/.next`
- Reinstall dependencies: `cd frontend && rm -rf node_modules && npm install`

### File Upload Issues
- Check Firebase Storage rules allow uploads
- Verify file size limits (10MB max)
- Check CORS settings in backend

## Security Notes

- Never commit `.env` files
- Use environment variables for all secrets
- Firestore security rules are enforced
- Rate limiting enabled on backend
- All API routes require authentication

## Support

For issues or questions, check:
- Firebase Documentation
- Next.js Documentation
- Express.js Documentation


