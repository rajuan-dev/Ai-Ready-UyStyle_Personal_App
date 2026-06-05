import { FirebaseApp, getApp as getFirebaseApp, getApps, initializeApp } from 'firebase/app';
import {
  Auth,
  getAuth as getFirebaseAuth,
  initializeAuth,
} from 'firebase/auth';
import {
  Firestore,
  getFirestore as getFirebaseFirestore,
  initializeFirestore,
} from 'firebase/firestore';
import { FirebaseStorage, getStorage as getFirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyBvjn_sPL2WGdv19bGAjE60XYRh5RIuSUQ',
  appId: '1:844436071910:ios:eb0f2d6274d4e1d1b1a227',
  messagingSenderId: '844436071910',
  projectId: 'ustyle-2d7b5',
  storageBucket: 'ustyle-2d7b5.firebasestorage.app',
};

let authInstance: Auth | null = null;
let firestoreInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;

const appInstance: FirebaseApp = getApps().length
  ? getFirebaseApp()
  : initializeApp(firebaseConfig);

export function getApp() {
  return appInstance;
}

export function getAuth(_app?: FirebaseApp) {
  if (authInstance) {
    return authInstance;
  }

  try {
    authInstance = initializeAuth(appInstance);
  } catch {
    authInstance = getFirebaseAuth(appInstance);
  }

  return authInstance;
}

export function getFirestore(_app?: FirebaseApp) {
  if (firestoreInstance) {
    return firestoreInstance;
  }

  try {
    firestoreInstance = initializeFirestore(appInstance, {
      experimentalAutoDetectLongPolling: true,
    });
  } catch {
    firestoreInstance = getFirebaseFirestore(appInstance);
  }

  return firestoreInstance;
}

export function getStorage(_app?: FirebaseApp) {
  if (!storageInstance) {
    storageInstance = getFirebaseStorage(appInstance);
  }

  return storageInstance;
}
