# 🚀 Arogyam 360 Deployment Guide

This guide will help you deploy your Arogyam 360 healthcare application to production.

## 📋 Table of Contents
- [Recommended Hosting Stack](#recommended-hosting-stack)
- [Option 1: Vercel + Render (Recommended)](#option-1-vercel--render-recommended)
- [Option 2: Railway (All-in-One)](#option-2-railway-all-in-one)
- [Option 3: AWS/DigitalOcean (Advanced)](#option-3-awsdigitalocean-advanced)
- [Environment Variables Checklist](#environment-variables-checklist)
- [Post-Deployment Steps](#post-deployment-steps)

---

## 🎯 Recommended Hosting Stack

**Best Choice for Your App:**
- **Frontend (Next.js)**: Vercel (free tier available)
- **Backend (Express)**: Render or Railway (free tier available)
- **Database**: Supabase (already hosted ✅)
- **Authentication**: Firebase (already hosted ✅)

**Why this stack?**
- ✅ Free tiers available
- ✅ Easy deployment
- ✅ Auto-scaling
- ✅ Great performance
- ✅ Built-in SSL certificates

---

## 🌟 Option 1: Vercel + Render (Recommended)

### A. Deploy Frontend to Vercel

#### Step 1: Prepare Your Repository
```bash
# Initialize git if not already done
git init

# Create .gitignore if needed
# Make sure node_modules, .env files are ignored
```

#### Step 2: Push to GitHub
```bash
# Create a new repository on GitHub
# Then push your code
git add .
git commit -m "Initial commit for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/arogyam360.git
git push -u origin main
```

#### Step 3: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Import your `arogyam360final` repository
5. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

#### Step 4: Add Environment Variables in Vercel
Go to Project Settings → Environment Variables and add:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Step 5: Deploy
- Click "Deploy"
- Wait 2-3 minutes
- Your frontend will be live at `https://your-app.vercel.app`

---

### B. Deploy Backend to Render

#### Step 1: Prepare Backend
Create a `render.yaml` file in your backend directory:

```yaml
services:
  - type: web
    name: arogyam360-backend
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
```

#### Step 2: Deploy to Render
1. Go to [render.com](https://render.com)
2. Sign up/Login with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: arogyam360-backend
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

#### Step 3: Add Environment Variables
In Render dashboard, add these environment variables:

```env
PORT=10000
NODE_ENV=production

# Firebase Admin
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY=your_private_key

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# CORS (Your Vercel frontend URL)
ALLOWED_ORIGINS=https://your-app.vercel.app
```

#### Step 4: Deploy
- Click "Create Web Service"
- Wait for deployment (5-10 minutes)
- Your backend will be live at `https://arogyam360-backend.onrender.com`

#### Step 5: Update Frontend
Go back to Vercel and update:
```env
NEXT_PUBLIC_API_URL=https://arogyam360-backend.onrender.com
```
Redeploy frontend.

---

## 🚂 Option 2: Railway (All-in-One)

Railway can host both frontend and backend together.

### Step 1: Deploy to Railway
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository

### Step 2: Add Services
Railway will detect both frontend and backend.

**For Backend:**
- Root Directory: `backend`
- Start Command: `npm start`
- Add all environment variables from above

**For Frontend:**
- Root Directory: `frontend`
- Build Command: `npm run build`
- Start Command: `npm start`
- Add all environment variables from above

### Step 3: Configure Domains
Railway provides free `.railway.app` domains for both services.

---

## ☁️ Option 3: AWS/DigitalOcean (Advanced)

### Frontend: AWS Amplify or DigitalOcean App Platform
### Backend: EC2 or DigitalOcean Droplet

This option is for advanced users who need more control. It requires:
- Setting up servers
- Configuring reverse proxy (Nginx)
- Managing SSL certificates
- Setting up CI/CD pipelines

**Cost**: ~$10-50/month depending on traffic

---

## 📝 Environment Variables Checklist

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### Backend (.env)
```env
PORT=
NODE_ENV=production
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
GEMINI_API_KEY=
ALLOWED_ORIGINS=
```

---

## ✅ Post-Deployment Steps

### 1. Update Firebase Configuration
Add your production domain to Firebase:
- Go to [Firebase Console](https://console.firebase.google.com)
- Select your project
- Go to Authentication → Settings → Authorized domains
- Add your Vercel domain (e.g., `your-app.vercel.app`)

### 2. Update Supabase CORS
- Go to Supabase Dashboard
- Project Settings → API
- Add your frontend URL to allowed origins

### 3. Test Your Application
- [ ] User registration works
- [ ] User login works
- [ ] Dashboard loads correctly
- [ ] Chatbot responds
- [ ] Reports can be uploaded
- [ ] Consultations can be booked
- [ ] Theme switching works
- [ ] Profile updates work

### 4. Set Up Custom Domain (Optional)
**Vercel:**
- Go to Project Settings → Domains
- Add your custom domain
- Update DNS records as instructed

**Render:**
- Go to Settings → Custom Domain
- Add your domain
- Update DNS records

### 5. Monitor Your Application
- **Vercel**: Analytics tab for frontend metrics
- **Render**: Logs tab for backend logs
- **Supabase**: Database monitoring

### 6. Set Up Backup (Important!)
- Supabase has automatic backups
- Download your Firebase service account key
- Export environment variables to a secure location

---

## 🔥 Quick Deploy Commands

### Test Production Build Locally First

**Frontend:**
```bash
cd frontend
npm run build
npm start
# Visit http://localhost:3000
```

**Backend:**
```bash
cd backend
npm start
# Visit http://localhost:5001
```

If both work locally, they'll work in production!

---

## 🆘 Common Issues

### Issue: CORS Errors
**Solution**: Make sure `ALLOWED_ORIGINS` in backend matches your frontend URL exactly (no trailing slash)

### Issue: 502 Bad Gateway on Render
**Solution**: Render's free tier spins down after inactivity. First request may take 30-60 seconds.

### Issue: Build Fails on Vercel
**Solution**: 
- Check Node version compatibility
- Make sure all dependencies are in `package.json`
- Check build logs for specific errors

### Issue: Environment Variables Not Working
**Solution**:
- In Next.js, variables MUST start with `NEXT_PUBLIC_` to be accessible in browser
- Redeploy after adding/changing environment variables
- Check for typos in variable names

---

## 💰 Cost Estimate

### Free Tier (Recommended for Start)
- **Vercel**: Free (Hobby plan)
- **Render**: Free (with limitations)
- **Supabase**: Free (500MB database)
- **Firebase**: Free (Spark plan)
- **Total**: $0/month ✅

### Production Ready
- **Vercel Pro**: $20/month
- **Render Starter**: $7/month
- **Supabase Pro**: $25/month
- **Total**: ~$52/month

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)

---

## 🎉 Congratulations!

Once deployed, your healthcare application will be live and accessible worldwide!

**Your URLs will be:**
- Frontend: `https://your-app.vercel.app`
- Backend API: `https://your-backend.onrender.com`

Share it with the world! 🌍
