
import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  onSnapshot, 
  deleteDoc, 
  increment, 
  arrayUnion, 
  Timestamp, 
  limit,
  where, 
  writeBatch, 
  serverTimestamp,
  Firestore
} from 'firebase/firestore';
import { getDatabase, ref, set, onValue, remove, Database, push, onDisconnect } from 'firebase/database';
import { getAuth, signInAnonymously, signOut, Auth } from 'firebase/auth';
import { WithdrawalRecord, Publication, ViewType, Comment, LiveStreamSession } from '../types';

const firebaseConfig = {
  apiKey: "AIzaSyAKnoCa3sKwZrQaUXy0PNkJ1FbsJGAOyjk",
  authDomain: "studio-3236344976-c8013.firebaseapp.com",
  databaseURL: "https://studio-3236344976-c8013-default-rtdb.firebaseio.com",
  projectId: "studio-3236344976-c8013",
  storageBucket: "studio-3236344976-c8013.firebasestorage.app",
  messagingSenderId: "689062563273",
  appId: "1:689062563273:web:31e28523c69098e781ac18"
};

function getFirebaseApp(): FirebaseApp {
  const existingApps = getApps();
  if (existingApps.length > 0) return existingApps[0];
  return initializeApp(firebaseConfig);
}

export const app = getFirebaseApp();
export const db_fs: Firestore = getFirestore(app);
export const database: Database = getDatabase(app);
export const auth: Auth = getAuth(app);

export const MIN_WITHDRAW_GEMS = 2000; 
export const GEMS_PER_DOLLAR = 100;

export interface UserDB {
  uid: string;
  name: string;
  email: string;
  diamonds: number;
  usd_balance: number; 
  withdrawals: WithdrawalRecord[];
  album: any[];
  bio?: string;
  avatar?: string;
  cover?: string;
  dob?: string;
  gender?: 'men' | 'women' | 'other';
  country?: string;
  referredBy?: string;
  referralCount?: number;
  status?: 'active' | 'banned';
  role?: 'doll' | 'mentor' | 'admin';
  joinedAt?: Timestamp;
  lastActiveView?: ViewType;
}

class DatabaseService {
  async getUser(uid: string): Promise<UserDB | null> {
    if (!uid) return null;
    try {
      const snap = await getDoc(doc(db_fs, 'users', uid));
      return snap.exists() ? snap.data() as UserDB : null;
    } catch (e) { return null; }
  }

  async getAllUsers(): Promise<UserDB[]> {
    try {
      const q = query(collection(db_fs, 'users'), orderBy('joinedAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data() as UserDB);
    } catch (e) { return []; }
  }

  async upsertUser(user: Partial<UserDB> & { uid: string }): Promise<UserDB> {
    const userRef = doc(db_fs, 'users', user.uid);
    try {
      const existing = await this.getUser(user.uid);
      const data = {
        ...user,
        email: user.email?.toLowerCase().trim() || existing?.email || '',
        joinedAt: existing?.joinedAt || Timestamp.now(),
        diamonds: user.diamonds ?? existing?.diamonds ?? 50,
        role: user.role || existing?.role || 'doll',
        lastActiveView: user.lastActiveView || existing?.lastActiveView || 'feed',
        status: user.status || existing?.status || 'active'
      };
      await setDoc(userRef, data, { merge: true });
      return data as UserDB;
    } catch (e) { throw e; }
  }

  async updateViewPreference(uid: string, view: ViewType) {
    if (!uid) return;
    try {
      await updateDoc(doc(db_fs, 'users', uid), { lastActiveView: view });
    } catch (e) {}
  }

  async logout() { await signOut(auth); }

  async getPlatformRevenue(): Promise<number> {
    try {
      const q = query(collection(db_fs, 'transactions'), where("status", "==", "COMPLETED"));
      const snap = await getDocs(q);
      let total = 0;
      snap.forEach(d => total += (d.data().price || 0));
      return total;
    } catch (e) { return 0; }
  }

  async getPlatformStats(): Promise<any> {
    const users = await this.getAllUsers();
    const revenue = await this.getPlatformRevenue();
    let totalPayouts = 0;
    let dollCount = 0;
    users.forEach(u => {
      if (u.role === 'doll') dollCount++;
      (u.withdrawals || []).forEach(w => {
        if (w.status === 'completed') totalPayouts += w.amountUsd;
      });
    });
    return {
      revenue,
      totalPayouts,
      userCount: users.length,
      dollCount,
      liabilityUsd: users.reduce((acc, u) => acc + (u.diamonds / GEMS_PER_DOLLAR), 0)
    };
  }

  // --- Real-time Presence & Streaming ---
  
  async startLiveSession(session: LiveStreamSession) {
    const streamRef = ref(database, `active_streams/${session.uid}`);
    await set(streamRef, {
      ...session,
      startedAt: Date.now()
    });
    onDisconnect(streamRef).remove();
  }

  async endLiveSession(uid: string) {
    const streamRef = ref(database, `active_streams/${uid}`);
    await remove(streamRef);
  }

  subscribeToActiveStreams(callback: (streams: LiveStreamSession[]) => void) {
    const streamsRef = ref(database, 'active_streams');
    return onValue(streamsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        callback([]);
        return;
      }
      const streams = Object.values(data) as LiveStreamSession[];
      callback(streams);
    });
  }

  // --- Firestore Social Operations ---

  subscribeToFeed(callback: (pubs: Publication[]) => void) {
    const q = query(collection(db_fs, 'publications'), orderBy('timestamp', 'desc'), limit(50));
    return onSnapshot(q, { includeMetadataChanges: true }, (snap) => {
      const pubs = snap.docs.map(d => {
        const data = d.data();
        let finalTimestamp: Date;
        if (data.timestamp && typeof data.timestamp.toDate === 'function') {
          finalTimestamp = data.timestamp.toDate();
        } else {
          finalTimestamp = new Date();
        }
        return { 
          ...data, 
          id: d.id,
          timestamp: finalTimestamp,
          isPending: d.metadata.hasPendingWrites 
        } as Publication & { isPending?: boolean };
      });
      callback(pubs);
    });
  }

  async addPublication(pub: Omit<Publication, 'id' | 'timestamp'>): Promise<void> {
    const pubRef = doc(collection(db_fs, 'publications'));
    await setDoc(pubRef, { 
      ...pub, 
      id: pubRef.id, 
      timestamp: serverTimestamp(), 
      likes: 0, 
      dislikes: 0, 
      comments: [] 
    });
  }

  async likePublication(pubId: string) {
    try { await updateDoc(doc(db_fs, 'publications', pubId), { likes: increment(1) }); } catch (e) {}
  }

  // Added dislikePublication method to resolve missing method error in FeedPage.tsx
  async dislikePublication(pubId: string) {
    try { await updateDoc(doc(db_fs, 'publications', pubId), { dislikes: increment(1) }); } catch (e) {}
  }

  async addCommentToPublication(pubId: string, comment: Comment) {
    try {
      await updateDoc(doc(db_fs, 'publications', pubId), {
        comments: arrayUnion({ ...comment, timestamp: Timestamp.now() })
      });
    } catch (e) {}
  }

  async capturePaypalOrder(orderID: string, uid: string, amount: number, price: number): Promise<{ success: boolean; message: string }> {
    try {
      const transRef = doc(db_fs, 'transactions', orderID);
      await setDoc(transRef, { orderID, userUid: uid, gems: amount, price, status: 'COMPLETED', timestamp: Timestamp.now() });
      await updateDoc(doc(db_fs, 'users', uid), { diamonds: increment(amount) });
      return { success: true, message: "Order Captured." };
    } catch (e: any) { return { success: false, message: e.message }; }
  }

  async clearAllData(): Promise<{ success: boolean; message: string }> {
    try {
      const collections = ['users', 'publications', 'transactions'];
      for (const colName of collections) {
        const snap = await getDocs(collection(db_fs, colName));
        const batch = writeBatch(db_fs);
        snap.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();
      }
      const streamsRef = ref(database, 'active_streams');
      await remove(streamsRef);
      return { success: true, message: "Cloud Wipe Complete." };
    } catch (e: any) { return { success: false, message: e.message }; }
  }

  async toggleUserStatus(uid: string): Promise<void> {
    const user = await this.getUser(uid);
    if (!user) return;
    await updateDoc(doc(db_fs, 'users', uid), { status: user.status === 'banned' ? 'active' : 'banned' });
  }

  async getAllWithdrawals(): Promise<any[]> {
    const users = await this.getAllUsers();
    const withdrawals: any[] = [];
    users.forEach(u => (u.withdrawals || []).forEach(w => withdrawals.push({ ...w, userName: u.name, userEmail: u.email })));
    return withdrawals.sort((a, b) => {
      const tA = a.timestamp instanceof Timestamp ? a.timestamp.toMillis() : new Date(a.timestamp).getTime();
      const tB = b.timestamp instanceof Timestamp ? b.timestamp.toMillis() : new Date(b.timestamp).getTime();
      return tB - tA;
    });
  }
}

export const db = new DatabaseService();
