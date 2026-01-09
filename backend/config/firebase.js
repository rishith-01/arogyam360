import admin from 'firebase-admin';

let firebaseInitialized = false;

function ensureInitialized() {
  if (firebaseInitialized) {
    return;
  }

  try {
    console.log('🔄 Initializing Firebase Admin...');
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    console.log('   Project ID:', serviceAccount.projectId);
    console.log('   Client Email:', serviceAccount.clientEmail);
    console.log('   Private Key length:', serviceAccount.privateKey?.length || 0);

    if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
      throw new Error('Missing Firebase configuration. Check environment variables: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
    }

    console.log('   Calling admin.initializeApp...');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
    });

    firebaseInitialized = true;
    console.log('✅ Firebase Admin initialized');
  } catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
    console.error('   Stack:', error.stack);
    throw error;
  }
}

export function initializeFirebase() {
  ensureInitialized();
  return admin.app();
}

// Export Firebase services with lazy initialization
export const db = {
  collection: (path) => {
    ensureInitialized();
    return admin.firestore().collection(path);
  },
  batch: () => {
    ensureInitialized();
    return admin.firestore().batch();
  },
  runTransaction: (updateFunction) => {
    ensureInitialized();
    return admin.firestore().runTransaction(updateFunction);
  },
  // Add other commonly used methods
  doc: (path) => {
    ensureInitialized();
    return admin.firestore().doc(path);
  }
};

export const storage = {
  bucket: (name) => {
    ensureInitialized();
    if (name) {
      return admin.storage().bucket(name);
    }
    // Return default bucket if no name provided
    return admin.storage().bucket();
  }
};

export const auth = {
  verifyIdToken: (token) => {
    ensureInitialized();
    return admin.auth().verifyIdToken(token);
  },
  getUser: (uid) => {
    ensureInitialized();
    return admin.auth().getUser(uid);
  },
  deleteUser: (uid) => {
    ensureInitialized();
    return admin.auth().deleteUser(uid);
  }
};
