# ⚡ Quick Start Guide

## 🚀 Run the Application (Windows)

**On Windows, run frontend and backend in separate terminals:**

### Terminal 1 - Backend

```bash
cd backend
npm run dev
```

**Wait for:**
```
✅ Firebase Admin initialized
⚠️  OPENAI_API_KEY not set. Chatbot feature will be disabled.
🚀 Backend server running on port 3001
```

### Terminal 2 - Frontend

Open a **NEW** terminal/PowerShell window:

```bash
cd frontend
npm run dev
```

**Wait for:**
```
- ready started server on 0.0.0.0:3000
- Local: http://localhost:3000
```

---

## ✅ Verify It's Working

1. **Backend**: Open http://localhost:3001/health
   - Should show: `{"status":"ok","timestamp":"..."}`

2. **Frontend**: Open http://localhost:3000
   - Should show the login/signup page

---

## 🎯 Next Steps

1. **Sign Up**: Create a new account
2. **Explore**: Try uploading a report, checking medications, etc.
3. **Chatbot**: Will show a message that it needs OpenAI key (optional)

---

## 🐛 If Backend Won't Start

Check your `backend/.env` file has:
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Run this to check:
```bash
cd backend
node check-env.js
```

---

## 🐛 If Frontend Won't Start

Check your `frontend/.env.local` file has all Firebase config values.

---

## 📝 Summary

- **Backend**: `cd backend && npm run dev` (Terminal 1)
- **Frontend**: `cd frontend && npm run dev` (Terminal 2)
- **No need to run `npm run dev` from root on Windows!**

That's it! 🎉


