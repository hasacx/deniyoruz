import { auth, db } from './config';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';

// Auth servisleri
export const authService = {
  register: async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  },

  login: async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  },

  logout: async () => {
    await signOut(auth);
  }
};

// Esans servisleri
export const essenceService = {
  addEssence: async (essenceData) => {
    const docRef = await addDoc(collection(db, 'essences'), {
      ...essenceData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  deleteEssence: async (essenceId) => {
    await deleteDoc(doc(db, 'essences', essenceId));
  },

  updateEssence: async (essenceId, updates) => {
    await updateDoc(doc(db, 'essences', essenceId), updates);
  },

  subscribeToEssences: (callback) => {
    return onSnapshot(collection(db, 'essences'), (snapshot) => {
      const essences = [];
      snapshot.forEach((doc) => {
        essences.push({ id: doc.id, ...doc.data() });
      });
      callback(essences);
    });
  }
};

// Talep servisleri
export const demandService = {
  addDemand: async (demandData) => {
    const docRef = await addDoc(collection(db, 'demands'), {
      ...demandData,
      createdAt: serverTimestamp(),
      status: 'pending'
    });
    return docRef.id;
  },

  deleteDemand: async (demandId) => {
    await deleteDoc(doc(db, 'demands', demandId));
  },

  updateDemand: async (demandId, updates) => {
    await updateDoc(doc(db, 'demands', demandId), updates);
  },

  subscribeToDemands: (callback) => {
    return onSnapshot(collection(db, 'demands'), (snapshot) => {
      const demands = [];
      snapshot.forEach((doc) => {
        demands.push({ id: doc.id, ...doc.data() });
      });
      callback(demands);
    });
  },

  subscribeToLargeDemands: (callback) => {
    const q = query(
      collection(db, 'demands'),
      where('quantity', '>', 250)
    );

    return onSnapshot(q, (snapshot) => {
      const demands = [];
      snapshot.forEach((doc) => {
        demands.push({ id: doc.id, ...doc.data() });
      });
      callback(demands);
    });
  }
};