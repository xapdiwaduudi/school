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
import { SupermarketData } from './types';

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

const SUPERMARKET_DOC_ID = 'main_supermarket_data';

// Real-time synchronization subscription
export function subscribeToSupermarketData(
  onData: (data: SupermarketData) => void,
  onError?: (err: Error) => void
) {
  const docRef = doc(db, 'supermarket_data', SUPERMARKET_DOC_ID);
  
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as SupermarketData;
        onData(data);
      }
    },
    (error) => {
      console.warn('Firestore real-time sync error:', error);
      if (onError) onError(error);
    }
  );
}

// Save complete supermarket data to Firestore cloud
export async function saveSupermarketDataToCloud(data: SupermarketData): Promise<void> {
  const docRef = doc(db, 'supermarket_data', SUPERMARKET_DOC_ID);
  await setDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString()
  }, { merge: true });
}

// Fetch initial data once from cloud
export async function fetchSupermarketDataFromCloud(): Promise<SupermarketData | null> {
  try {
    const docRef = doc(db, 'supermarket_data', SUPERMARKET_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as SupermarketData;
    }
    return null;
  } catch (err) {
    console.warn('Error fetching initial cloud supermarket data:', err);
    return null;
  }
}

// Backward compatibility wrappers
export const subscribeToSchoolData = subscribeToSupermarketData;
export const saveSchoolDataToCloud = saveSupermarketDataToCloud;
export const fetchSchoolDataFromCloud = fetchSupermarketDataFromCloud;
