
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import 'dotenv/config';

// Initialize Firebase
// We need to construct the credentials object from env vars similar to server.js or firebase.js
const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!serviceAccount.privateKey) {
    console.error('❌ Error: FIREBASE_PRIVATE_KEY not found in .env');
    process.exit(1);
}

initializeApp({
    credential: cert(serviceAccount),
});

const db = getFirestore();
const auth = getAuth();

async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    const email = args[1];

    if (!command || !email) {
        console.log(`
Usage:
  node manage-users.js view <email>
  node manage-users.js set-role <email> <role> (patient|doctor)
    `);
        process.exit(1);
    }

    try {
        const user = await auth.getUserByEmail(email);
        console.log(`\nUser found: ${user.email} (${user.uid})`);

        const userDocRef = db.collection('users').doc(user.uid);
        const userDoc = await userDocRef.get();

        if (command === 'view') {
            if (userDoc.exists) {
                console.log('Current Firestore Data:', userDoc.data());
            } else {
                console.log('❌ No Firestore document found for this user.');
            }
        } else if (command === 'set-role') {
            const newRole = args[2];
            if (!['patient', 'doctor'].includes(newRole)) {
                console.error('❌ Invalid role. Must be "patient" or "doctor".');
                process.exit(1);
            }

            await userDocRef.set({ role: newRole }, { merge: true });
            console.log(`✅ updated role to "${newRole}" for ${email}`);
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

main();
