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

const provider = new GoogleAuthProvider();
provider.addScope('https://mail.google.com/');
provider.addScope('https://www.googleapis.com/auth/gmail.send');
provider.addScope('https://www.googleapis.com/auth/gmail.compose');
provider.addScope('https://www.googleapis.com/auth/gmail.readonly');
provider.addScope('https://www.googleapis.com/auth/drive');
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/drive.metadata');

let cachedAccessToken: string | null = null;
let isSigningIn = false;

export interface FirebaseUserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'doctor' | 'patient';
  licenseOrPatientId?: string;
  facility?: string;
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
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
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
          displayName: user.displayName || (intendedRole === 'doctor' ? 'Dr. Sarah Jenkins' : 'Shardul Kush'),
          role: intendedRole,
          licenseOrPatientId: extraDetails?.licenseOrPatientId || (intendedRole === 'doctor' ? 'MD-LIC-992014' : 'MED-PASS-994821-X'),
          facility: extraDetails?.facility || (intendedRole === 'doctor' ? 'St. Mary’s General Hospital' : 'Personal Health Record'),
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
        displayName: user.displayName || (intendedRole === 'doctor' ? 'Dr. Sarah Jenkins' : 'Shardul Kush'),
        role: intendedRole,
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
  return cachedAccessToken;
};

export const signOutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};
