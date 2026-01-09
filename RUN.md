# 🚀 How to Run Arogyam-360

## Option 1: Run Both Together (Recommended)

From the **root directory**:

```bash
npm run dev
```

This starts both frontend and backend simultaneously.

---

## Option 2: Run Separately (If Option 1 Doesn't Work)

### Terminal 1 - Backend

```bash
cd backend
npm run dev
```

You should see:
```
🚀 Backend server running on port 3001
📁 Using LOCAL file storage (no Firebase Storage needed)
```

### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

You should see:
```
- ready started server on 0.0.0.0:3000
- Local: http://localhost:3000
```

---

## Option 3: Windows PowerShell (If Issues Persist)

If you're on Windows and getting `spawn cmd.exe ENOENT` errors:

### PowerShell Method:

**Terminal 1:**
```powershell
cd backend
npm run dev
```

**Terminal 2:**
```powershell
cd frontend
npm run dev
```

---

## ✅ Verify It's Working

1. **Backend**: Check http://localhost:3001/health
   - Should return: `{"status":"ok","timestamp":"..."}`

2. **Frontend**: Open http://localhost:3000
   - Should show the login/signup page

---

## 🐛 Troubleshooting

### Error: `spawn cmd.exe ENOENT`

**Solution**: Use Option 2 or 3 (run separately in different terminals)

### Port Already in Use

**Solution**: 
- Close other applications using port 3000 or 3001
- Or change ports in `.env` files

### Module Not Found

**Solution**:
```bash
npm run install:all
```

### Backend Won't Start

**Check**:
- `backend/.env` file exists
- Firebase credentials are correct
- No syntax errors in `.env` file

### Frontend Won't Start

**Check**:
- `frontend/.env.local` file exists
- All `NEXT_PUBLIC_` variables are set
- Clear cache: `cd frontend && rm -rf .next && npm run dev`

---

## 📝 Quick Commands Reference

```bash
# Install all dependencies
npm run install:all

# Run both (if working)
npm run dev

# Run frontend only
npm run dev:frontend
# OR
cd frontend && npm run dev

# Run backend only
npm run dev:backend
# OR
cd backend && npm run dev
```

---

## 🎯 Next Steps After Running

1. Open http://localhost:3000
2. Sign up for a new account
3. Start using the platform!


