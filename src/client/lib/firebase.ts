import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, type User } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
  );
}

// Initialize Firebase safely without connecting to unconfigured or third-party accounts
export const app = getApps().length > 0
  ? getApp()
  : initializeApp(
      isFirebaseConfigured()
        ? firebaseConfig
        : {
            apiKey: 'AIzaSy_mock_api_key_for_build_purposes_only',
            authDomain: 'unconfigured.firebaseapp.com',
            projectId: 'unconfigured-project',
            storageBucket: 'unconfigured.firebasestorage.app',
            messagingSenderId: '000000000000',
            appId: '1:000000000000:web:00000000000000',
          }
    );

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Configure Google provider prompts
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export interface GoogleAuthResult {
  user: User;
  idToken: string;
}

/**
 * Initiates Google OAuth Popup via Firebase Auth
 */
export async function signInWithGooglePopup(): Promise<GoogleAuthResult> {
  if (!isFirebaseConfigured()) {
    throw new Error(
      'Firebase Authentication is not configured. Please define VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, and VITE_FIREBASE_APP_ID in your environment.'
    );
  }

  const result = await signInWithPopup(auth, googleProvider);
  const idToken = await result.user.getIdToken();
  return {
    user: result.user,
    idToken,
  };
}

/**
 * Sign out from Firebase Auth
 */
export async function logoutFirebase(): Promise<void> {
  if (isFirebaseConfigured()) {
    await signOut(auth);
  }
}

