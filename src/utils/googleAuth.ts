import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
const databaseId = (firebaseConfig as any).firestoreDatabaseId || 'ai-studio-remixmedpassclin-d2d624db-b44c-4828-b735-9aef095ba2f0';
export const db = getFirestore(app, databaseId);

// Principle of Least Privilege:
// Scoped ONLY to files created by MedPass and transactional sending, NEVER full inbox or drive root
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file'); // Only files created or opened by MedPass
provider.addScope('https://www.googleapis.com/auth/gmail.send'); // Scoped to sending notifications, zero inbox read access

const TOKEN_SESSION_KEY = 'medpass_ephemeral_oauth_token';
let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Attempt to restore token from secure ephemeral session
try {
  cachedAccessToken = sessionStorage.getItem(TOKEN_SESSION_KEY);
} catch {
  // Storage unavailable or restricted context
}

export interface FirebaseUserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'doctor' | 'patient';
  licenseOrPatientId?: string;
  facility?: string;
  licenseVerificationStatus?: 'verified' | 'provisional_demo' | 'pending';
  createdAt?: string;
  lastLoginAt?: string;
}

// Test connection on boot
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline or pending connection.');
    }
  }
}
testFirestoreConnection();

export const initGoogleAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    const activeToken = cachedAccessToken || sessionStorage.getItem(TOKEN_SESSION_KEY) || '';
    if (user && activeToken) {
      cachedAccessToken = activeToken;
      if (onAuthSuccess) onAuthSuccess(user, activeToken);
    } else if (user) {
      // User is authenticated via Firebase but Google OAuth token needs refreshed session
      if (onAuthSuccess) onAuthSuccess(user, '');
    } else {
      if (!isSigningIn && onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Sign in with Google and register/update role profile in Firestore
 */
export const signInWithGoogleRole = async (
  intendedRole: 'doctor' | 'patient' = 'doctor',
  extraDetails?: { licenseOrPatientId?: string; facility?: string }
): Promise<{ user: User; accessToken: string; profile: FirebaseUserProfile }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to retrieve access token from Google sign in');
    }
    cachedAccessToken = credential.accessToken;
    try {
      sessionStorage.setItem(TOKEN_SESSION_KEY, cachedAccessToken);
    } catch {
      // Ignore sessionStorage write errors
    }
    const user = result.user;

    // Fetch or create user profile in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    let profileData: FirebaseUserProfile;

    try {
      const existingDoc = await getDoc(userDocRef);
      if (existingDoc.exists()) {
        const data = existingDoc.data() as FirebaseUserProfile;
        profileData = {
          ...data,
          lastLoginAt: new Date().toISOString(),
        };
        await setDoc(userDocRef, profileData, { merge: true });
      } else {
        profileData = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || (intendedRole === 'doctor' ? 'Dr. Sarah Jenkins' : 'Patient Vault'),
          role: intendedRole,
          licenseOrPatientId: extraDetails?.licenseOrPatientId || (intendedRole === 'doctor' ? 'MD-LIC-992014' : 'MED-PASS-994821-X'),
          facility: extraDetails?.facility || (intendedRole === 'doctor' ? 'St. Mary’s General Hospital' : 'Personal Health Record'),
          licenseVerificationStatus: intendedRole === 'doctor' ? 'provisional_demo' : 'verified',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };
        await setDoc(userDocRef, profileData);
      }
    } catch (fsErr) {
      console.warn('Firestore user profile sync error (using local profile):', fsErr);
      profileData = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || (intendedRole === 'doctor' ? 'Dr. Sarah Jenkins' : 'Patient Vault'),
        role: intendedRole,
        licenseVerificationStatus: 'provisional_demo',
        lastLoginAt: new Date().toISOString(),
      };
    }

    return { user, accessToken: cachedAccessToken, profile: profileData };
  } catch (error: any) {
    console.error('Google Sign-in Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const signInWithGoogle = async (): Promise<{ user: User; accessToken: string }> => {
  const res = await signInWithGoogleRole('doctor');
  return { user: res.user, accessToken: res.accessToken };
};

export const getGoogleAccessToken = (): string | null => {
  if (!cachedAccessToken) {
    try {
      cachedAccessToken = sessionStorage.getItem(TOKEN_SESSION_KEY);
    } catch {
      // storage unavailable
    }
  }
  return cachedAccessToken;
};

export const signOutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
  try {
    sessionStorage.removeItem(TOKEN_SESSION_KEY);
  } catch {
    // ignore
  }
};
