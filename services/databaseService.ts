
import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, orderBy, 
  getDocs, onSnapshot, deleteDoc, increment, arrayUnion, Timestamp, limit, 
  enableNetwork, where, Firestore, writeBatch, serverTimestamp
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

// Singleton initialization pattern for Firebase
function getFirebaseApp(): FirebaseApp {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0];
  }
  return initializeApp(firebaseConfig);
}

const app = getFirebaseApp();

// Initialize services with the specific app instance
export const db_fs: Firestore = getFirestore(app);
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
  joinedAt?: string;
  lastActiveView?: ViewType;
}

class DatabaseService {
  async getUser(uid: string): Promise<UserDB | null> {
    if (!uid) return null;
    try {
      const snap = await getDoc(doc(db_fs, 'users', uid));
      return snap.exists() ? snap.data() as UserDB : null;
    } catch (e) { 
      console.error("Error getting user:", e);
      return null; 
    }
  }

  async getAllUsers(): Promise<UserDB[]> {
    try {
      const q = query(collection(db_fs, 'users'), orderBy('joinedAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data() as UserDB);
    } catch (e) { 
      console.error("Error getting all users:", e);
      return []; 
    }
  }

  async upsertUser(user: UserDB): Promise<UserDB> {
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
    } catch (e) { 
      console.error("Error upserting user:", e);
      return user; 
    }
  }

  async updateViewPreference(uid: string, view: ViewType) {
    if (!uid) return;
    try {
      const userRef = doc(db_fs, 'users', uid);
      await updateDoc(userRef, { lastActiveView: view });
    } catch (e) {
      console.error("Error updating view preference:", e);
    }
  }

  async logout() { await signOut(auth); }

  async getPlatformRevenue(): Promise<number> {
    try {
      const q = query(collection(db_fs, 'transactions'), where("status", "==", "COMPLETED"));
      const snap = await getDocs(q);
      let total = 0;
      snap.forEach(d => total += (d.data().price || 0));
      return total;
    } catch (e) { 
      console.error("Error getting revenue:", e);
      return 0; 
    }
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

  async clearAllData(): Promise<{ success: boolean; message: string }> {
    try {
      const collections = ['users', 'publications', 'transactions'];
      for (const colName of collections) {
        const snap = await getDocs(collection(db_fs, colName));
        const batch = writeBatch(db_fs);
        snap.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();
      }
      return { success: true, message: "Database reset successfully." };
    } catch (e: any) { 
      console.error("Error clearing data:", e);
      return { success: false, message: e.message }; 
    }
  }

  async toggleUserStatus(uid: string): Promise<void> {
    try {
      const user = await this.getUser(uid);
      if (!user) return;
      const newStatus = user.status === 'banned' ? 'active' : 'banned';
      await updateDoc(doc(db_fs, 'users', uid), { status: newStatus });
    } catch (e) {
      console.error("Error toggling status:", e);
    }
  }

  async capturePaypalOrder(orderID: string, uid: string, amount: number, price: number): Promise<{ success: boolean; message: string }> {
    try {
      const transRef = doc(db_fs, 'transactions', orderID);
      await setDoc(transRef, {
        orderID,
        userUid: uid,
        gems: amount,
        price,
        status: 'COMPLETED',
        timestamp: serverTimestamp()
      });
      const userRef = doc(db_fs, 'users', uid);
      await updateDoc(userRef, { diamonds: increment(amount) });
      return { success: true, message: "Order captured!" };
    } catch (e: any) { 
      console.error("Error capturing order:", e);
      return { success: false, message: e.message }; 
    }
  }

  // --- Real-time Feed Operations ---
  
  subscribeToFeed(callback: (pubs: Publication[]) => void) {
    if (!db_fs) {
      console.error("Firestore not initialized for subscription");
      return () => {};
    }

    const q = query(collection(db_fs, 'publications'), orderBy('timestamp', 'desc'), limit(50));
    
    return onSnapshot(q, { includeMetadataChanges: true }, (snap) => {
      const pubs = snap.docs.map(d => {
        const data = d.data();
        let ts: Date;
        
        if (data.timestamp && typeof (data.timestamp as any).toDate === 'function') {
          ts = (data.timestamp as Timestamp).toDate();
        } else {
          // If serverTimestamp is pending, use current local time
          ts = new Date();
        }

        return { 
          ...data, 
          id: d.id,
          timestamp: ts,
          likes: data.likes || 0,
          dislikes: data.dislikes || 0,
          comments: data.comments || [],
          isPending: d.metadata.hasPendingWrites 
        } as Publication & { isPending?: boolean };
      });
      callback(pubs);
    }, (error) => {
      console.error("Firestore feed subscription error:", error);
    });
  }

  async addPublication(pub: Omit<Publication, 'id' | 'timestamp'>): Promise<void> {
    try {
      const pubRef = doc(collection(db_fs, 'publications'));
      await setDoc(pubRef, { 
        ...pub, 
        id: pubRef.id, 
        timestamp: serverTimestamp(),
        likes: 0,
        dislikes: 0,
        comments: []
      });
    } catch (err) {
      console.error("Failed to add publication:", err);
      throw err;
    }
  }

  async likePublication(pubId: string) {
    try {
      await updateDoc(doc(db_fs, 'publications', pubId), {
        likes: increment(1)
      });
    } catch (e) {
      console.error("Error liking publication:", e);
    }
  }

  async dislikePublication(pubId: string) {
    try {
      await updateDoc(doc(db_fs, 'publications', pubId), {
        dislikes: increment(1)
      });
    } catch (e) {
      console.error("Error disliking publication:", e);
    }
  }

  async addCommentToPublication(pubId: string, comment: Comment) {
    try {
      await updateDoc(doc(db_fs, 'publications', pubId), {
        comments: arrayUnion({
          ...comment,
          timestamp: new Date() 
        })
      });
    } catch (e) {
      console.error("Error adding comment:", e);
    }
  }

  async getAllWithdrawals(): Promise<any[]> {
    try {
      const users = await this.getAllUsers();
      const withdrawals: any[] = [];
      users.forEach(u => {
        (u.withdrawals || []).forEach(w => {
          withdrawals.push({ ...w, userName: u.name, userEmail: u.email });
        });
      });
      return withdrawals.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (e) {
      console.error("Error getting withdrawals:", e);
      return [];
    }
  }
}

export const db = new DatabaseService();
