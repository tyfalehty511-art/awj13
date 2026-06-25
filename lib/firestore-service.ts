import { 
  Firestore, 
  collection, 
  query, 
  where, 
  getDocs, 
  limit, 
  doc, 
  getDoc,
  addDoc, 
  setDoc,
  updateDoc,
  serverTimestamp,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  orderBy,
  deleteDoc,
  collectionGroup,
  writeBatch
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FirebaseApp } from 'firebase/app';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

const USD_TO_SAR = 3.75;

export const storeConverter: FirestoreDataConverter<any> = {
  toFirestore: (data: any) => data,
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions) => {
    const data = snapshot.data(options);
    return { id: snapshot.id, ...data };
  }
};

async function getDocResilient(docRef: any) {
  try {
    return await getDoc(docRef);
  } catch (error: any) {
    console.warn("Firestore Read Error:", error.message);
    return { exists: () => false, data: () => null };
  }
}

export async function getPlatformSettings(db: Firestore) {
  try {
    const configRef = doc(db, 'config', 'platform');
    const snapshot = await getDocResilient(configRef);
    if (!snapshot.exists()) {
      return {
        siteName: 'أوج',
        primaryColor: '#6168F0',
        domainProfitMargin: 15,
        platformFee: 9,
        announcementActive: false
      };
    }
    return snapshot.data();
  } catch (err) {
    console.error("Platform Settings Fetch Error:", err);
    return null;
  }
}

export function updatePlatformSettings(db: Firestore, data: any) {
  const configRef = doc(db, 'config', 'platform');
  setDoc(configRef, {
    ...data,
    updatedAt: serverTimestamp()
  }, { merge: true }).catch(async (err) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: configRef.path,
      operation: 'write',
      requestResourceData: data
    }));
  });
}

export async function getStoreBySubdomain(db: Firestore, subdomain: string) {
  const storesRef = collection(db, 'stores').withConverter(storeConverter);
  const q = query(storesRef, where('subdomain', '==', subdomain.toLowerCase()), limit(1));
  try {
    const snapshot = await getDocs(q);
    if (!snapshot.empty) return snapshot.docs[0].data();
    return null;
  } catch (e) { 
    console.error("Store Fetch Error:", e);
    return null; 
  }
}

export async function getStoreByCustomDomain(db: Firestore, domain: string) {
  const storesRef = collection(db, 'stores').withConverter(storeConverter);
  const q = query(storesRef, where('custom_domain', '==', domain.toLowerCase()), limit(1));
  try {
    const snapshot = await getDocs(q);
    if (!snapshot.empty) return snapshot.docs[0].data();
    return null;
  } catch (e) { return null; }
}

export async function getStoreByOwner(db: Firestore, ownerUid: string) {
  const storesRef = collection(db, 'stores').withConverter(storeConverter);
  const q = query(storesRef, where('owner_uid', '==', ownerUid), limit(1));
  try {
    const snapshot = await getDocs(q);
    if (!snapshot.empty) return snapshot.docs[0].data();
    return null;
  } catch (e) { return null; }
}

export function updateStoreSettings(db: Firestore, storeId: string, data: any) {
  if (!storeId) return;
  const storeRef = doc(db, 'stores', storeId);
  setDoc(storeRef, {
    ...data,
    updatedAt: serverTimestamp()
  }, { merge: true }).catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
      path: storeRef.path,
      operation: 'write',
      requestResourceData: data,
    } satisfies SecurityRuleContext);
    errorEmitter.emit('permission-error', permissionError);
  });
}

export async function getProducts(db: Firestore, storeId: string) {
  try {
    const productsRef = collection(db, 'stores', storeId, 'products');
    const q = query(productsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) { 
    console.error("Products Fetch Error:", e);
    return []; 
  }
}

export async function getProductById(db: Firestore, storeId: string, productId: string) {
  const productRef = doc(db, 'stores', storeId, 'products', productId);
  const snapshot = await getDocResilient(productRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
}

export function deleteProduct(db: Firestore, storeId: string, productId: string) {
  const productRef = doc(db, 'stores', storeId, 'products', productId);
  deleteDoc(productRef).catch(async () => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: productRef.path,
      operation: 'delete'
    }));
  });
}

export async function uploadProductFile(app: FirebaseApp, file: File, storeId: string) {
  const storage = getStorage(app);
  const fileRef = ref(storage, `stores/${storeId}/products/${Date.now()}_${file.name}`);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
}

export async function uploadLogo(app: FirebaseApp, file: File, storeId: string) {
  const storage = getStorage(app);
  const fileRef = ref(storage, `stores/${storeId}/branding/logo_${Date.now()}_${file.name}`);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
}

export function addProduct(db: Firestore, storeId: string, productData: any) {
  const productsRef = collection(db, 'stores', storeId, 'products');
  addDoc(productsRef, {
    ...productData,
    createdAt: serverTimestamp()
  }).catch(async (error) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: productsRef.path,
      operation: 'create',
      requestResourceData: productData,
    } satisfies SecurityRuleContext));
  });
}

export async function getRecentOrders(db: Firestore, storeId: string, limitCount = 10) {
  try {
    const ordersRef = collection(db, 'stores', storeId, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) { return []; }
}

export function updateOrderStatus(db: Firestore, storeId: string, orderId: string, status: string) {
  const orderRef = doc(db, 'stores', storeId, 'orders', orderId);
  updateDoc(orderRef, { status, updatedAt: serverTimestamp() }).catch(async () => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: orderRef.path,
      operation: 'update',
      requestResourceData: { status }
    }));
  });
}

export async function getTransactions(db: Firestore, storeId: string) {
  try {
    const transRef = collection(db, 'stores', storeId, 'transactions');
    const q = query(transRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) { return []; }
}

export async function createPendingOrder(db: Firestore, storeId: string, orderData: any) {
  const ordersRef = collection(db, 'stores', storeId, 'orders');
  return addDoc(ordersRef, {
    ...orderData,
    status: 'pending_payment',
    createdAt: serverTimestamp()
  });
}

export async function searchDomainExtensions(db: Firestore, name: string) {
  try {
    const settings = await getPlatformSettings(db);
    const profit_margin = settings?.domainProfitMargin ?? 15;
    const setup_fee = 15;
    
    const extensions = [
      { ext: '.sa', costUsd: 10 }, 
      { ext: '.com', costUsd: 12 },
      { ext: '.net', costUsd: 11 },
      { ext: '.site', costUsd: 2 }
    ];
    
    const results = [];
    const cleanName = name.split('.')[0].toLowerCase();
    
    for (const item of extensions) {
      const fullDomain = `${cleanName}${item.ext}`;
      const available = !['google.com', 'awj.site'].includes(fullDomain);
      const costSar = item.costUsd * USD_TO_SAR;
      const annualPrice = costSar + profit_margin; 
      const totalPrice = annualPrice + setup_fee;
      
      results.push({
        domain: fullDomain,
        available,
        price: totalPrice,
        annual_price: annualPrice,
        setup_fee: setup_fee
      });
    }
    return results;
  } catch (err) {
    console.error("Domain Search Error:", err);
    return [];
  }
}

export function createDomainOrder(db: Firestore, data: { domain_name: string, owner_uid: string, amount: number }) {
  const ordersRef = collection(db, 'domain_orders');
  addDoc(ordersRef, {
    ...data,
    status: 'paid_pending_registration',
    createdAt: serverTimestamp()
  }).catch(async () => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: ordersRef.path,
      operation: 'create',
      requestResourceData: data
    }));
  });
}

export async function getAllStoresForVerification(db: Firestore) {
  const storesRef = collection(db, 'stores');
  const q = query(storesRef, where('verification_status', 'in', ['pending', 'verified', 'rejected']));
  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) { return []; }
}

export function updateVerificationStatus(db: Firestore, storeId: string, status: string, reason?: string) {
  const storeRef = doc(db, 'stores', storeId);
  updateDoc(storeRef, { 
    verification_status: status, 
    verification_reject_reason: reason || null,
    updatedAt: serverTimestamp() 
  }).catch(async () => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: storeRef.path,
      operation: 'update'
    }));
  });
}

export async function getAllWithdrawalRequests(db: Firestore) {
  try {
    const requestsRef = collection(db, 'withdrawal_requests');
    const q = query(requestsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) { return []; }
}

export function updateWithdrawalStatus(db: Firestore, storeId: string, withdrawalId: string, status: string, reason?: string) {
  const requestRef = doc(db, 'withdrawal_requests', withdrawalId);
  updateDoc(requestRef, { 
    status, 
    reject_reason: reason || null,
    updatedAt: serverTimestamp() 
  }).catch(async () => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: requestRef.path,
      operation: 'update'
    }));
  });
}

export async function getAllDomainRequests(db: Firestore) {
  try {
    const requestsRef = collection(db, 'domain_requests');
    const q = query(requestsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) { return []; }
}

export function updateDomainRequestStatus(db: Firestore, requestId: string, status: string) {
  const requestRef = doc(db, 'domain_requests', requestId);
  updateDoc(requestRef, { status, updatedAt: serverTimestamp() }).catch(async () => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: requestRef.path,
      operation: 'update'
    }));
  });
}

export function finalizeDomainMapping(db: Firestore, requestId: string, storeId: string, finalDomain: string) {
  const batch = writeBatch(db);
  const requestRef = doc(db, 'domain_requests', requestId);
  batch.update(requestRef, { status: 'completed', final_domain: finalDomain });
  const storeRef = doc(db, 'stores', storeId);
  batch.update(storeRef, { custom_domain: finalDomain });
  batch.commit().catch(async () => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: 'batch_operation',
      operation: 'write'
    }));
  });
}

export async function getAllTransactionsForAdmin(db: Firestore) {
  const transRef = collectionGroup(db, 'transactions');
  const q = query(transRef, orderBy('createdAt', 'desc'), limit(100));
  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) { return []; }
}

export async function uploadVerificationDoc(app: FirebaseApp, file: File, storeId: string, type: 'id' | 'doc') {
  const storage = getStorage(app);
  const fileRef = ref(storage, `verification/${storeId}/${type}_${Date.now()}_${file.name}`);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
}

export async function uploadPlatformLogo(app: FirebaseApp, file: File) {
  const storage = getStorage(app);
  const fileRef = ref(storage, `platform/branding/logo_${Date.now()}_${file.name}`);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
}
