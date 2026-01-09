@echo off
echo Creating backend .env file...
echo.

(
echo PORT=3001
echo FIREBASE_PROJECT_ID=arogyam360-23855
echo FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@arogyam360-23855.iam.gserviceaccount.com
echo FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC8zaBFI/fR4TL8\nuZTkzNQr0VxxDXmh/OJy6lgx99sC6KDtE9jyfcKg646tKveclpXR+JZK0QT/4aIG\nlHPZ9NHlyWVMB9mXCZO3macvGq22FgrOzk1iEZVn8ab0slZw1SmtaAg9VIf7OFz3\nHzx7dCJ/l8ZHpLDP67NWuKVc1IZjQnyCZH6CGWMjzwbtcuxBSjZf9wvJHb1jFx4r\ny9XHGZO3Hg1fU6Byy8eQRm/br0OVUR2DU8f8K3aQWal3SHmJUhc2+bTGiNGZvZfK\naHA3y/dSzmWa9lm1z9ZMPpYsJH6kEXKcOG1CL1ALR9b7Nzg17zi4szIpkdQkkJu0\nQglHd515AgMBAAECggEAGdF8szfB8d9723d9VvRzpzJQE92l3nL4fIJzYRHlzzYE\nm6b1KePss5jCwAd6KN2myznVQ5HlvyAZyhCO7yU9dtDdm1IPfUn/+0F1zUk2rAnD\nnJg1mM2Sws4W6Ktiird7pYzuY4Slu8LvY5PP74noFc6pfK6WxzgSJC/H3TPq1LPM\nSZYkEBpS6+3j/vThTYorruEmXkmmwbLu5jfpNDOnrhQbihIzIEMeMWsomYkUXfA5\nt24iLUHIefsMBws9QyQ12SghhKeIIHRvIJ36kaETTzfV9txU6nScXRJRplJ7mHGj\nsJ+9r0w1dHw6yMvuVCn8sijHceF5+T8C8tHxmCciyQKBgQD3jceQYJ4D4zgaHgSG\nEphgL19TqUK4Gs8+Iq+y5diIpRvaT15kxhAUYeLnRgIa9KWHbUIwrVFoPaK6Ehdk\nDUYFJfHP6G1ePqSyssg5dk4Y6JjZVF/rVGfEqMRx2pkId8JdzuPOuBLCpGI7VmOc\nDXET5VWFmpzOCUNv0TkRLvwouwKBgQDDPrLSL+y+/sCh1NVltp9KpeoCER2MIMFu\nUFP4B3MXtCZfrQQcIC+pOal104AV+WBbFKUOGVJvyzcxJkFbdUOEAIVVGxeZv2bV\nENpWpUeRgmZNpCiE7KVnOoJ2VswFXy0zBDETV0TOvSwgnQlWV6xWaQ/RKPQdKqQs\nzkV1Q9K5WwKBgQDumgHyn51OA/BsA+i6TSv+8UoBOhAroPOFYStV1AG72uAYsA08\nNkcDTkHERg77ajgtatq0Tik7vsSccZmH/t8xURxcFxtrDhfygS1JbUTi7zV7q75z\n9Tu7KiuFzXtY1Q1LG4EpGvRCFOz1YlPJ8o697XpbtuVSFU2hddh6Pn4exwKBgQCK\nvgQ+vpWix89FcMPQCq05U5ttqpHvoNszs9tnlouf3YGjXYRdJDYaMAKO2yPa+aIS\nNyJvWWkuTh9DSucIwdSfeetFpgHoXI4LfHVbOwoXia1/INc2Vh/XsklBJL7IVnD9\nHs5s6wfXTbCM4GrhM14g7Xmy7UJDc6jEujO7d93HnwKBgEBdvMzWXNrMf45DZrDd\njHbhmUEcZEXygYEaTL8aMv1EueHX27A8GlrNYt8HmcwzRqsdlphHn7gzN58DkwYp\nV+v5w/K68zldPiVRRL0xN+pfq4AZ7mBWoXxD2vmv9uk5U6F96bhjOJdkdm+WitLi\nGYzTZzCsbfEWC7TGa4ZJ/w3j\n-----END PRIVATE KEY-----\n"
echo GEMINI_API_KEY=your-gemini-api-key-here
echo FRONTEND_URL=http://localhost:3000
echo NODE_ENV=development
echo STORAGE_METHOD=local
) > backend\.env

echo.
echo ✅ Backend .env file created successfully!
echo.
echo ⚠️  IMPORTANT: You need to add your Gemini API key to backend\.env
echo    Open backend\.env and replace "your-gemini-api-key-here" with your actual key
echo.
echo    To get a Gemini API key:
echo    1. Go to https://aistudio.google.com/app/apikey
echo    2. Sign in or create an account
echo    3. Click "Create API key"
echo    4. Copy the key and paste it in backend\.env
echo.
pause
