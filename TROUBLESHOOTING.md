# 🔧 Troubleshooting Guide

## Firebase Initialization Error

### Error: "The default Firebase app does not exist"

This means your `backend/.env` file is missing or has incorrect Firebase credentials.

### Solution:

1. **Check if `.env` file exists:**
   ```bash
   cd backend
   ls .env  # On Windows: dir .env
   ```

2. **If it doesn't exist, create it:**
   ```bash
   cd backend
   # Create .env file with these variables
   ```

3. **Verify your `.env` file has these values:**
   ```env
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour full key here\n-----END PRIVATE KEY-----\n"
   ```

4. **Check your values:**
   ```bash
   cd backend
   node check-env.js
   ```

5. **Common issues:**
   - ❌ Missing quotes around `FIREBASE_PRIVATE_KEY`
   - ❌ Missing `\n` characters in private key
   - ❌ Wrong project ID
   - ❌ Wrong service account email

---

## How to Get Firebase Credentials

### Step 1: Get Service Account JSON

1. Go to Firebase Console → Project Settings
2. Click "Service accounts" tab
3. Click "Generate new private key"
4. Download the JSON file

### Step 2: Extract Values from JSON

Open the JSON file and copy:

```json
{
  "project_id": "your-project-id",           → FIREBASE_PROJECT_ID
  "client_email": "firebase-adminsdk-...",  → FIREBASE_CLIENT_EMAIL
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"  → FIREBASE_PRIVATE_KEY
}
```

### Step 3: Format for .env

**Important**: For `FIREBASE_PRIVATE_KEY`:
- Keep the quotes: `"..."`  
- Keep the `\n` characters (they represent newlines)
- Include the full key from `-----BEGIN` to `-----END`

Example:
```env
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

---

## Quick Test

Run this to check your environment:

```bash
cd backend
node check-env.js
```

You should see:
```
✅ FIREBASE_PROJECT_ID: your-project-id
✅ FIREBASE_CLIENT_EMAIL: firebase-adminsdk-...
✅ FIREBASE_PRIVATE_KEY: -----BEGIN PRIVATE KEY-----...-----END PRIVATE KEY-----
✅ All required variables are set!
```

---

## Still Having Issues?

1. **Double-check your `.env` file location:**
   - Should be: `backend/.env` (not `backend/.env.local`)

2. **Verify file encoding:**
   - Should be UTF-8
   - No BOM (Byte Order Mark)

3. **Check for hidden characters:**
   - Make sure there are no extra spaces
   - Private key should be on one line with `\n` characters

4. **Restart your server:**
   ```bash
   # Stop server (Ctrl+C)
   cd backend
   npm run dev
   ```

---

## Need More Help?

- Check `FIREBASE_SETUP.md` for detailed Firebase setup
- Check `NEXT_STEPS.md` for complete setup guide
- Verify your Firebase project is set up correctly


