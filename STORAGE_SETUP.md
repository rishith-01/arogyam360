# Storage Setup - No Firebase Upgrade Needed! ✅

## 🎉 Good News!

**You DON'T need to upgrade your Firebase plan!** The app now supports **local file storage** by default, which works perfectly for hackathons and demos.

---

## 📁 How It Works

### Default: Local File Storage (No Firebase Storage Needed)

- Files are stored in `backend/uploads/reports/` directory
- Each user has their own folder: `backend/uploads/reports/{userId}/`
- Files are served via Express static file server
- **No cloud storage costs!**
- **No Firebase Storage setup required!**

### Optional: Firebase Storage

If you want to use Firebase Storage later, just:
1. Enable Firebase Storage in console
2. Add `STORAGE_METHOD=firebase` to `backend/.env`
3. Restart the server

---

## 🚀 Quick Setup (Local Storage - Default)

### Step 1: No Configuration Needed!

The app is already configured to use local storage by default. Just:

1. **Make sure `backend/.env` has:**
   ```env
   STORAGE_METHOD=local
   API_URL=http://localhost:3001
   ```
   (These are the defaults, so you can skip this if you want)

2. **Run the backend:**
   ```bash
   cd backend
   npm run dev
   ```

3. **The `uploads/` directory will be created automatically!**

That's it! ✅

---

## 📂 File Structure

When you upload reports, files will be stored like this:

```
backend/
└── uploads/
    └── reports/
        └── {userId}/
            ├── 1234567890_report1.pdf
            ├── 1234567891_report2.jpg
            └── ...
```

---

## 🔗 How Files Are Accessed

Files are served at:
```
http://localhost:3001/api/reports/files/{userId}/{filename}
```

The frontend automatically uses these URLs when you upload reports.

---

## ⚙️ Configuration

### Use Local Storage (Default - Recommended for Hackathon)

In `backend/.env`:
```env
STORAGE_METHOD=local
API_URL=http://localhost:3001
```

### Use Firebase Storage (If You Upgrade Later)

In `backend/.env`:
```env
STORAGE_METHOD=firebase
API_URL=http://localhost:3001
```

Then enable Firebase Storage in Firebase Console.

---

## ✅ Advantages of Local Storage

1. ✅ **No Firebase upgrade needed**
2. ✅ **No cloud costs**
3. ✅ **Works immediately**
4. ✅ **Perfect for demos/hackathons**
5. ✅ **Easy to test locally**
6. ✅ **Files stored on your server**

---

## ⚠️ Important Notes

1. **`.gitignore` is configured** - The `uploads/` folder won't be committed to Git
2. **Files are user-specific** - Each user can only access their own files
3. **File size limit**: 10 MB per file (configurable)
4. **Supported formats**: PDF, JPG, PNG

---

## 🔄 Switching Between Storage Methods

### From Local to Firebase:

1. Enable Firebase Storage in console
2. Update `backend/.env`: `STORAGE_METHOD=firebase`
3. Restart backend server

### From Firebase to Local:

1. Update `backend/.env`: `STORAGE_METHOD=local`
2. Restart backend server
3. Files will now be stored locally

---

## 🎯 For Hackathon/Demo

**Use local storage!** It's:
- ✅ Free
- ✅ No setup needed
- ✅ Works perfectly
- ✅ No Firebase Storage required

Just run the app and start uploading reports! 🚀

---

## 📝 Summary

- **Default**: Local file storage (no Firebase Storage needed)
- **Location**: `backend/uploads/reports/`
- **Configuration**: `STORAGE_METHOD=local` in `backend/.env`
- **No upgrade required!** ✅

---

**You're all set!** The app will work perfectly without upgrading your Firebase plan. 🎉


