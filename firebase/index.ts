
import { getFirebaseApp, getFirestoreInstance, getAuthInstance, getStorageInstance } from './config';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';
import { FirebaseStorage } from 'firebase/storage';

export function initializeFirebase(): { app: FirebaseApp; firestore: Firestore; auth: Auth; storage: FirebaseStorage } {
  const app = getFirebaseApp();
  const firestore = getFirestoreInstance();
  const auth = getAuthInstance();
  const storage = getStorageInstance();
  return { app, firestore, auth, storage };
}

export * from './provider';
export { useUser } from './auth/use-user';
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';
