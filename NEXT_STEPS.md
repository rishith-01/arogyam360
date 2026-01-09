# 🚀 Next Steps - Getting Arogyam-360 Running

Follow these steps in order to get your healthcare platform up and running!

---

## ✅ Step 1: Set Up Firebase (15-20 minutes)

### 1.1 Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Click "Add project" or "Create a project"
3. Name it: `arogyam360` (or your choice)
4. Follow the prompts to create the project

### 1.2 Enable Authentication
1. In Firebase Console → **Authentication**
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Enable **"Email/Password"**
5. Click **Save**

### 1.3 Create Firestore Database
1. In Firebase Console → **Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in production mode"**
4. Select location (e.g., `asia-south1` for India)
5. Click **Enable**

### 1.4 Deploy Security Rules
1. In Firestore → **Rules** tab
2. Copy content from `firestore.rules` file in this project
3. Paste into Firebase Console
4. Click **"Publish"**

### 1.5 Get Configuration Values
1. Click gear icon ⚙️ → **Project settings**
2. Scroll to **"Your apps"** → Click **Web icon** `</>`
3. Register app: `Arogyam-360 Web`
4. **Copy these values** (you'll need them):
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

### 1.6 Create Service Account (Backend)
1. In Project settings → **Service accounts** tab
2. Click **"Generate new private key"**
3. **Save the JSON file** (keep it secure!)
4. Extract from JSON:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY`

✅ **Firebase setup complete!**

---

## ✅ Step 2: Install Dependencies (5 minutes)

Open terminal in project root and run:

```bash
# Install all dependencies (root, frontend, backend)
npm run install:all
```

This will install:
- Root dependencies (concurrently)
- Frontend dependencies (Next.js, React, etc.)
- Backend dependencies (Express, Firebase Admin, etc.)

**Wait for installation to complete** (2-5 minutes)

---

## ✅ Step 3: Configure Environment Variables (10 minutes)

### 3.1 Frontend Configuration

Create `frontend/.env.local` file:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_from_step_1.5
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Replace all `your_xxx` values with actual values from Step 1.5**

### 3.2 Backend Configuration

Create `backend/.env` file:

```env
PORT=3001
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour full private key here\n-----END PRIVATE KEY-----\n"
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:3000
STORAGE_METHOD=local
API_URL=http://localhost:3001
```

**Replace values:**
- `FIREBASE_PROJECT_ID`: From service account JSON (Step 1.6)
- `FIREBASE_CLIENT_EMAIL`: From service account JSON (Step 1.6)
- `FIREBASE_PRIVATE_KEY`: From service account JSON (Step 1.6) - **Keep quotes and \n**
- `GEMINI_API_KEY`: Get from https://aistudio.google.com/app/apikey

⚠️ **Important**: For `FIREBASE_PRIVATE_KEY`, copy the ENTIRE key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`, keep it in quotes, and preserve the `\n` characters.

---

## ✅ Step 4: Get Gemini API Key (5 minutes)

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign up or log in
3. Click **"Get API key"**
4. Click **"Create API key"**
5. Copy the key
6. Paste into `backend/.env` as `GEMINI_API_KEY`

---

## ✅ Step 5: Run the Application (2 minutes)

### ⚠️ Windows Users: If you get `spawn cmd.exe ENOENT` error, use Option B!

### Option A: Run Both Frontend & Backend Together

From project root:
```bash
npm run dev
```

This starts:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

**If this doesn't work on Windows**, use Option B below.

### Option B: Run Separately (Recommended for Windows)

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

**See [RUN.md](./RUN.md) for detailed run instructions and troubleshooting.**

---

## ✅ Step 6: Test the Application

1. **Open browser**: http://localhost:3000

2. **Sign Up**:
   - Click "Sign up"
   - Enter name, email, password
   - Select role: "Patient"
   - Click "Sign Up"

3. **You should see**:
   - Dashboard with welcome message
   - Stats showing 0 reports, 0 consultations, etc.
   - Feature cards (Reports, Medications, Nutrition, etc.)

4. **Test a Feature**:
   - Click "Medical Reports"
   - Click "Upload Report"
   - Upload a test PDF/JPG file
   - See it analyzed and displayed!

---

## 🎯 Quick Checklist

Before running, make sure:

- [ ] Firebase project created
- [ ] Authentication enabled (Email/Password)
- [ ] Firestore database created
- [ ] Firestore security rules deployed
- [ ] Frontend `.env.local` file created with correct values
- [ ] Backend `.env` file created with correct values
- [ ] Gemini API key obtained and added
- [ ] Dependencies installed (`npm run install:all`)
- [ ] No errors in terminal when starting

---

## 🐛 Troubleshooting

### Backend won't start
- Check `backend/.env` file exists
- Verify Firebase credentials are correct
- Check port 3001 is not in use
- Look for error messages in terminal

### Frontend won't start
- Check `frontend/.env.local` file exists
- Verify all `NEXT_PUBLIC_` variables are set
- Check port 3000 is not in use
- Clear `.next` folder: `cd frontend && rm -rf .next`

### Authentication errors
- Verify Firebase Auth is enabled
- Check `NEXT_PUBLIC_FIREBASE_*` variables are correct
- Check browser console for errors

### Can't upload reports
- Check `STORAGE_METHOD=local` in `backend/.env`
- Verify `uploads/` directory is created (auto-created on first upload)
- Check file size (max 10MB)

### Chatbot not working
- Verify `GEMINI_API_KEY` is set in `backend/.env`
- Check OpenAI account has credits
- Check backend console for errors

---

## 📚 Need Help?

- **Firebase Setup**: See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
- **Storage Setup**: See [STORAGE_SETUP.md](./STORAGE_SETUP.md)
- **Storage Alternatives**: See [STORAGE_ALTERNATIVES.md](./STORAGE_ALTERNATIVES.md)
- **Project Overview**: See [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)

---

## 🎉 You're Ready!

Once you complete these steps, your Arogyam-360 platform will be fully functional!

**Next**: Start with Step 1 and work through each step. Take your time - it's better to do it right than rush! 🚀

