# Arogyam-360 — Integrated Digital Healthcare Platform

A production-ready healthcare web platform for patients to manage their health, understand medical reports, check drug interactions, get nutrition plans, and consult with doctors.

## 🏗️ Architecture

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS + Framer Motion
- **Backend**: Node.js + Express + Firebase Admin SDK
- **Database**: Firestore
- **Storage**: Firebase Storage
- **Auth**: Firebase Authentication
- **Chatbot**: Single LLM-powered assistant (no autonomous agents)

## 🚀 Getting Started

### Quick Start Guide

**📖 New to this project? Start here:** [NEXT_STEPS.md](./NEXT_STEPS.md) - Complete step-by-step guide!

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project with Auth and Firestore enabled
- **Storage**: Local file storage (default) - **No Firebase Storage upgrade needed!** ✅
- Gemini API key (for chatbot)

### Installation

1. Clone the repository
2. **Set up Firebase** (Required first step):
   - 📖 **See detailed guide**: [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
   - This guide walks you through Firebase setup step-by-step
3. Install dependencies:
```bash
npm run install:all
```

4. Set up environment variables:

**Frontend** (`frontend/.env.local`):
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Backend** (`backend/.env`):
```
PORT=3001
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY=your_private_key
GEMINI_API_KEY=your_gemini_key
```

4. Deploy Firestore security rules (see `firestore.rules`)

5. Run development servers:

**Windows Users**: Run in separate terminals (see [QUICK_START.md](./QUICK_START.md))

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Frontend: http://localhost:3000
Backend: http://localhost:3001

**Note**: On Windows, `npm run dev` from root may not work. Use separate terminals instead.

## 📁 Project Structure

```
arogyam360final/
├── frontend/          # Next.js application
├── backend/           # Express API server
├── firestore.rules    # Firestore security rules
└── README.md
```

## 🔐 Security

- Firestore security rules enforce data isolation
- Role-based access control (Patient/Doctor)
- Patient data encryption in transit
- Consent tracking for medical data

## ⚠️ Medical Disclaimer

This platform provides informational assistance only. It does not replace professional medical advice, diagnosis, or treatment. Always consult qualified healthcare providers for medical decisions.

