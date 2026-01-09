# Firebase Setup Guide - Step by Step

This guide will walk you through setting up Firebase for Arogyam-360 from scratch.

## 📋 Prerequisites

- A Google account
- Node.js installed on your machine
- Basic understanding of web development

---

## Step 1: Create Firebase Project

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Sign in with your Google account

2. **Create New Project**
   - Click **"Add project"** or **"Create a project"**
   - Enter project name: `arogyam360` (or your preferred name)
   - Click **Continue**

3. **Configure Google Analytics (Optional)**
   - You can enable or disable Google Analytics
   - For this project, it's optional
   - Click **Continue** → **Create project**
   - Wait for project creation (30-60 seconds)
   - Click **Continue** when done

---

## Step 2: Enable Authentication

1. **Navigate to Authentication**
   - In the left sidebar, click **"Authentication"**
   - Click **"Get started"** (if first time)

2. **Enable Email/Password Provider**
   - Click on **"Sign-in method"** tab
   - Click on **"Email/Password"**
   - Toggle **"Enable"** to ON
   - Click **"Save"**

✅ **Authentication is now enabled!**

---

## Step 3: Create Firestore Database

1. **Navigate to Firestore**
   - In the left sidebar, click **"Firestore Database"**
   - Click **"Create database"**

2. **Choose Security Rules**
   - Select **"Start in production mode"** (we'll add custom rules later)
   - Click **Next**

3. **Choose Location**
   - Select a location closest to your users (e.g., `asia-south1` for India)
   - Click **Enable**
   - Wait for database creation (1-2 minutes)

✅ **Firestore Database is now created!**

---

## Step 4: Set Up Firestore Security Rules

1. **Go to Firestore Rules**
   - In Firestore Database page, click on **"Rules"** tab
   - You'll see default rules

2. **Copy Security Rules**
   - Open the `firestore.rules` file from this project
   - Copy all the content

3. **Paste and Publish**
   - Replace the default rules with the copied content
   - Click **"Publish"**
   - Wait for deployment confirmation

✅ **Security rules are now deployed!**

---

## Step 5: Enable Firebase Storage (Optional)

> **⚠️ Note**: If you don't want to upgrade your Firebase plan, you can use **local file storage** instead! The app is configured to use local storage by default. See [STORAGE_ALTERNATIVES.md](./STORAGE_ALTERNATIVES.md) for details.

### Option A: Use Local Storage (Recommended for Hackathon - No Upgrade Needed)

**Skip this step!** The app uses local file storage by default. Files will be stored in `backend/uploads/` directory.

### Option B: Use Firebase Storage

1. **Navigate to Storage**
   - In the left sidebar, click **"Storage"**
   - Click **"Get started"**

2. **Set Up Storage**
   - Choose **"Start in production mode"** (we'll add rules later)
   - Click **Next**

3. **Choose Location**
   - Select the same location as Firestore (for consistency)
   - Click **Done**
   - Wait for setup (30 seconds)

4. **Set Storage Rules (Optional but Recommended)**
   - Click on **"Rules"** tab
   - Add these rules for basic security:
   ```
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /reports/{userId}/{allPaths=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```
   - Click **"Publish"**

5. **Enable Firebase Storage in Backend**
   - Add to `backend/.env`: `STORAGE_METHOD=firebase`
   - Default is `local` (no Firebase Storage needed)

✅ **Storage configured!**

---

## Step 6: Get Frontend Configuration

1. **Go to Project Settings**
   - Click the gear icon ⚙️ next to "Project Overview"
   - Select **"Project settings"**

2. **Scroll to "Your apps" section**
   - You'll see options: Web, iOS, Android
   - Click on the **Web icon** `</>`

3. **Register App**
   - Enter app nickname: `Arogyam-360 Web`
   - **DO NOT** check "Also set up Firebase Hosting" (unless you want it)
   - Click **"Register app"**

4. **Copy Configuration**
   - You'll see a code snippet with `firebaseConfig`
   - Copy these values (you'll need them):
     - `apiKey`
     - `authDomain`
     - `projectId`
     - `storageBucket`
     - `messagingSenderId`
     - `appId`
   - Click **"Continue to console"**

✅ **Frontend config values obtained!**

---

## Step 7: Create Service Account (Backend)

1. **Go to Service Accounts**
   - Still in Project Settings
   - Click on **"Service accounts"** tab

2. **Generate New Private Key**
   - Click **"Generate new private key"**
   - A popup will appear - click **"Generate key"**
   - A JSON file will download automatically
   - **⚠️ IMPORTANT**: Save this file securely (it contains sensitive credentials)
   - **DO NOT** commit this file to Git

3. **Open the JSON File**
   - The file will look like this:
   ```json
   {
     "type": "service_account",
     "project_id": "your-project-id",
     "private_key_id": "...",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
     "client_email": "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com",
     ...
   }
   ```

4. **Extract Required Values**
   - `project_id` → This is your `FIREBASE_PROJECT_ID`
   - `client_email` → This is your `FIREBASE_CLIENT_EMAIL`
   - `private_key` → This is your `FIREBASE_PRIVATE_KEY`

✅ **Service account credentials obtained!**

---

## Step 8: Configure Frontend Environment

1. **Create Frontend Environment File**
   - Navigate to `frontend/` directory
   - Create a new file: `.env.local`

2. **Add Configuration**
   - Copy the template from `frontend/.env.example` (if exists) or use this:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

3. **Fill in the Values**
   - Replace all `your_xxx_here` with actual values from Step 6
   - Example:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAbc123xyz789
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=arogyam360.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=arogyam360
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=arogyam360.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abc123def456
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

✅ **Frontend configured!**

---

## Step 9: Configure Backend Environment

1. **Create Backend Environment File**
   - Navigate to `backend/` directory
   - Create a new file: `.env`

2. **Add Configuration**
   ```env
   PORT=3001
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
   OPENAI_API_KEY=your_openai_api_key
   FRONTEND_URL=http://localhost:3000
   ```

3. **Fill in the Values**
   - `FIREBASE_PROJECT_ID`: From service account JSON (Step 7)
   - `FIREBASE_CLIENT_EMAIL`: From service account JSON (Step 7)
   - `FIREBASE_PRIVATE_KEY`: From service account JSON (Step 7)
     - **⚠️ IMPORTANT**: 
       - Keep the quotes around the private key
       - Keep the `\n` characters (they represent newlines)
       - Copy the ENTIRE key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
   - `OPENAI_API_KEY`: Get from https://platform.openai.com/api-keys
   - `FRONTEND_URL`: Usually `http://localhost:3000`

4. **Example Backend .env**
   ```env
   PORT=3001
   FIREBASE_PROJECT_ID=arogyam360
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-abc123@arogyam360.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
   OPENAI_API_KEY=sk-proj-abc123xyz789
   FRONTEND_URL=http://localhost:3000
   ```

✅ **Backend configured!**

---

## Step 10: Verify Setup

1. **Test Firebase Connection (Frontend)**
   ```bash
   cd frontend
   npm run dev
   ```
   - Visit http://localhost:3000
   - Try signing up - it should work!

2. **Test Firebase Connection (Backend)**
   ```bash
   cd backend
   npm run dev
   ```
   - Check console for: `✅ Firebase Admin initialized`
   - If you see this, backend is connected!

3. **Test Firestore**
   - Sign up a user in the frontend
   - Go to Firebase Console → Firestore Database
   - You should see a `users` collection with your user data

---

## 🔍 Troubleshooting

### Issue: "Firebase: Error (auth/configuration-not-found)"
**Solution**: Check that all environment variables in `.env.local` are correct and start with `NEXT_PUBLIC_`

### Issue: "Firebase Admin initialization error"
**Solution**: 
- Verify `FIREBASE_PRIVATE_KEY` has quotes and `\n` characters
- Check that service account JSON was copied correctly
- Ensure `FIREBASE_PROJECT_ID` matches

### Issue: "Permission denied" in Firestore
**Solution**: 
- Check that Firestore security rules are deployed (Step 4)
- Verify rules match the `firestore.rules` file

### Issue: "Storage permission denied"
**Solution**: 
- Check Storage rules (Step 5)
- Verify user is authenticated

### Issue: Can't upload files
**Solution**:
- Check Storage is enabled
- Verify Storage rules allow authenticated uploads
- Check file size (max 10MB in code)

---

## 📝 Quick Reference

### Where to Find Values:

| Value | Location |
|-------|----------|
| API Key | Project Settings → Your apps → Web app config |
| Auth Domain | Project Settings → Your apps → Web app config |
| Project ID | Project Settings → General → Project ID |
| Storage Bucket | Project Settings → Your apps → Web app config |
| Sender ID | Project Settings → Your apps → Web app config |
| App ID | Project Settings → Your apps → Web app config |
| Service Account Email | Service Accounts → Generated JSON file |
| Private Key | Service Accounts → Generated JSON file |

### Important Files:
- `frontend/.env.local` - Frontend Firebase config
- `backend/.env` - Backend Firebase config
- `firestore.rules` - Security rules (deploy to Firebase)

---

## ✅ Checklist

Before running the app, ensure:

- [ ] Firebase project created
- [ ] Authentication enabled (Email/Password)
- [ ] Firestore Database created
- [ ] Firestore security rules deployed
- [ ] Storage enabled
- [ ] Storage rules configured
- [ ] Frontend `.env.local` configured
- [ ] Backend `.env` configured
- [ ] Service account JSON downloaded (keep secure!)
- [ ] OpenAI API key added (for chatbot)

---

## 🎉 You're Done!

Your Firebase setup is complete! You can now:

1. Run `npm run install:all` to install dependencies
2. Run `npm run dev` to start the application
3. Visit http://localhost:3000 to use Arogyam-360

---

## 🔒 Security Reminders

1. **Never commit** `.env` or `.env.local` files to Git
2. **Never commit** service account JSON files
3. **Keep** service account keys secure
4. **Rotate** keys if accidentally exposed
5. **Use** different Firebase projects for dev/production

---

**Need Help?** Check the main `SETUP.md` file or Firebase documentation: https://firebase.google.com/docs

