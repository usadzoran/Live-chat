
import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, orderBy, 
  getDocs, onSnapshot, deleteDoc, increment, arrayUnion, Timestamp, limit, 
  enableNetwork, where, Firestore, writeBatch
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged, signInAnonymously, signOut, Auth } from 'firebase/auth';
import { WithdrawalRecord, Publication, ViewType, Comment } from '../types';

const firebaseConfig = {
  apiKey: "AIzaSyAKnoCa3sKwZrQaUXy0PNkJ1FbsJGAOyjk",
  authDomain: "studio-3236344976-c8013.firebaseapp.com",
  projectId: "studio-3236344976-c8013",
  storageBucket: "studio-3236344976-c8013.firebasestorage.app",
  messagingSenderId: "689062563273",
  appId: "1:689062563273:web:31e28523c69098e781ac18"
};

let app: FirebaseApp;
try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
} catch (e) {
  app = {} as FirebaseApp;
}

export const db_fs: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);

export const MIN_WITHDRAW_GEMS = 2000; 
export const GEMS_PER_DOLLAR = 100;

export interface UserDB {
  uid: string; // Added UID field
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
  joinedAt?: string;
  lastActiveView?: ViewType;
}

class DatabaseService {
  // Use UID for primary fetching to ensure persistence after refresh
  async getUser(uid: string): Promise<UserDB | null> {
    if (!uid || !db_fs) return null;
    try {
      const snap = await getDoc(doc(db_fs, 'users', uid));
      return snap.exists() ? snap.data() as UserDB : null;
    } catch (e) { return null; }
  }

  // Find user by email for login simulation
  async getUserByEmail(email: string): Promise<UserDB | null> {
    if (!email || !db_fs) return null;
    try {
      const q = query(collection(db_fs, 'users'), where("email", "==", email.toLowerCase().trim()), limit(1));
      const snap = await getDocs(q);
      return !snap.empty ? snap.docs[0].data() as UserDB : null;
    } catch (e) { return null; }
  }

  async getAllUsers(): Promise<UserDB[]> {
    if (!db_fs) return [];
    try {
      const q = query(collection(db_fs, 'users'), orderBy('joinedAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data() as UserDB);
    } catch (e) { return []; }
  }

  async upsertUser(user: UserDB): Promise<UserDB> {
    if (!db_fs) return user;
    const userRef = doc(db_fs, 'users', user.uid);
    try {
      const existing = await this.getUser(user.uid);
      const data = {
        ...user,
        email: user.email.toLowerCase().trim(),
        joinedAt: existing?.joinedAt || new Date().toISOString(),
        diamonds: user.diamonds ?? existing?.diamonds ?? 50,
        role: user.role || existing?.role || 'doll',
        lastActiveView: user.lastActiveView || existing?.lastActiveView || 'feed',
        status: user.status || existing?.status || 'active'
      };
      await setDoc(userRef, data, { merge: true });
      return data;
    } catch (e) { return user; }
  }

  async updateViewPreference(uid: string, view: ViewType) {
    if (!db_fs || !uid) return;
    const userRef = doc(db_fs, 'users', uid);
    await updateDoc(userRef, { lastActiveView: view });
  }

  async getPlatformRevenue(): Promise<number> {
    if (!db_fs) return 0;
    try {
      const q = query(collection(db_fs, 'transactions'), where("status", "==", "COMPLETED"));
      const snap = await getDocs(q);
      let total = 0;
      snap.forEach(d => total += (d.data().price || 0));
      return total;
    } catch (e) { return 0; }
  }

  async requestWithdrawal(uid: string, paypalEmail: string, gems: number): Promise<{ success: boolean; message: string }> {
    if (!db_fs) return { success: false, message: "Database not connected" };
    const user = await this.getUser(uid);
    if (!user || user.diamonds < gems) return { success: false, message: "Insufficient gems" };

    const withdrawal: WithdrawalRecord = {
      id: Math.random().toString(36).substr(2, 9),
      amountUsd: gems / GEMS_PER_DOLLAR,
      gemsConverted: gems,
      paypalEmail,
      status: 'completed',
      timestamp: new Date()
    };

    const userRef = doc(db_fs, 'users', uid);
    await updateDoc(userRef, {
      diamonds: increment(-gems),
      withdrawals: arrayUnion(withdrawal)
    });

    return { success: true, message: "Withdrawal completed successfully!" };
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

  async getAllWithdrawals(): Promise<any[]> {
    const users = await this.getAllUsers();
    const withdrawals: any[] = [];
    users.forEach(u => {
      (u.withdrawals || []).forEach(w => {
        withdrawals.push({ ...w, userName: u.name, userEmail: u.email });
      });
    });
    return withdrawals.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async clearAllData(): Promise<{ success: boolean; message: string }> {
    if (!db_fs) return { success: false, message: "No DB connection" };
    try {
      const collections = ['users', 'publications', 'transactions'];
      for (const colName of collections) {
        const snap = await getDocs(collection(db_fs, colName));
        const batch = writeBatch(db_fs);
        snap.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();
      }
      return { success: true, message: "Database reset successfully." };
    } catch (e: any) { return { success: false, message: e.message }; }
  }

  async toggleUserStatus(uid: string): Promise<void> {
    const user = await this.getUser(uid);
    if (!user) return;
    const newStatus = user.status === 'banned' ? 'active' : 'banned';
    await updateDoc(doc(db_fs, 'users', uid), { status: newStatus });
  }

  async capturePaypalOrder(orderID: string, uid: string, amount: number, price: number): Promise<{ success: boolean; message: string }> {
    if (!db_fs) return { success: false, message: "DB error" };
    try {
      const transRef = doc(db_fs, 'transactions', orderID);
      await setDoc(transRef, {
        orderID,
        userUid: uid,
        gems: amount,
        price,
        status: 'COMPLETED',
        timestamp: Timestamp.now()
      });
      const userRef = doc(db_fs, 'users', uid);
      await updateDoc(userRef, { diamonds: increment(amount) });
      return { success: true, message: "Order captured!" };
    } catch (e: any) { return { success: false, message: e.message }; }
  }

  async logout() { await signOut(auth); }

  subscribeToFeed(callback: (pubs: Publication[]) => void) {
    if (!db_fs) return () => {};
    const q = query(collection(db_fs, 'publications'), orderBy('timestamp', 'desc'), limit(50));
    return onSnapshot(q, (snap) => {
      const pubs = snap.docs.map(d => {
        const data = d.data();
        return { 
          ...data, 
          id: d.id,
          timestamp: (data.timestamp as Timestamp)?.toDate() || new Date() 
        } as Publication;
      });
      callback(pubs);
    });
  }

  async addPublication(pub: Publication): Promise<void> {
    if (!db_fs) return;
    const pubRef = doc(collection(db_fs, 'publications'));
    await setDoc(pubRef, { 
      ...pub, 
      id: pubRef.id, 
      timestamp: Timestamp.now() 
    });
  }

  async updatePublication(pub: Publication): Promise<void> {
    if (!db_fs) return;
    const pubRef = doc(db_fs, 'publications', pub.id);
    await updateDoc(pubRef, {
      likes: pub.likes,
      dislikes: pub.dislikes,
      comments: pub.comments
    });
  }
}

export const db = new DatabaseService();
