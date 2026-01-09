# 🔑 How to Get Gemini API Key (For Chatbot Feature)

The chatbot feature requires a Google Gemini API key. Here's how to get one for free:

## Step 1: Go to Google AI Studio

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google Account.

## Step 2: Create API Key

1. Click on **"Get API key"** in the left sidebar.
2. Click **"Create API key"**.
3. You can create a key in a new project or an existing one.
4. **⚠️ IMPORTANT**: Copy the key immediately!
   - Gemini API keys are usually around 39 characters long.

## Step 3: Add to Backend .env

Add this line to your `backend/.env` file:

```env
GEMINI_API_KEY=your-actual-key-here
```

## Step 4: Restart Backend

```bash
cd backend
npm run dev
```

You should now see the chatbot working using Gemini 2.0 Flash! ✅

---

## 💰 Pricing & Credits

- **Free Tier**: Google offers a generous free tier for Gemini API.
- **Rate Limits**: The free tier has some rate limits (RPM/RPD), which are usually fine for development and testing.

## ✅ Verify It's Working

After adding the key and restarting:

1. Go to http://localhost:3000
2. Sign in
3. Click "Medical Chatbot"
4. Send a message
5. You should get a response!

## 🐛 Troubleshooting

### Error: "GEMINI_API_KEY environment variable not found"

**Solution**: Make sure:
- Key is in `backend/.env` file.
- Restart the backend server.

### Error: "API key not valid"

**Solution**:
- Verify the key is correct.
- Check for typos or extra spaces.

### Error: "429 Too Many Requests"

**Solution**:
- You have hit the free tier rate limit. Wait a minute and try again.
