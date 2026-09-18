import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeFirestore, 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot 
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { SchoolData } from './types';

// Initialize Firebase App safely (singleton)
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Database ID if configured
const dbId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? firebaseConfig.firestoreDatabaseId
  : undefined;

// Initialize Firestore with experimentalForceLongPolling to prevent iframe proxy stream timeouts
function getInitializedFirestore() {
  try {
    return initializeFirestore(app, {
      experimentalForceLongPolling: true,
    }, dbId);
  } catch (e) {
    return dbId ? getFirestore(app, dbId) : getFirestore(app);
  }
}

export const db = getInitializedFirestore();

const SCHOOL_DOC_ID = 'main_school_data';

// Real-time synchronization subscription
export function subscribeToSchoolData(
  onData: (data: SchoolData) => void,
  onError?: (err: Error) => void
) {
  const docRef = doc(db, 'school_data', SCHOOL_DOC_ID);
  
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as SchoolData;
        onData(data);
      }
    },
    (error) => {
      console.warn('Firestore real-time sync error:', error);
      if (onError) onError(error);
    }
  );
}

// Save complete school data to Firestore cloud
export async function saveSchoolDataToCloud(data: SchoolData): Promise<void> {
  const docRef = doc(db, 'school_data', SCHOOL_DOC_ID);
  await setDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString()
  }, { merge: true });
}

// Fetch initial data once from cloud
export async function fetchSchoolDataFromCloud(): Promise<SchoolData | null> {
  try {
    const docRef = doc(db, 'school_data', SCHOOL_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as SchoolData;
    }
    return null;
  } catch (err) {
    console.warn('Error fetching initial cloud school data:', err);
    return null;
  }
}
