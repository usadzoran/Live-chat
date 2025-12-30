
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
  enableNetwork,
  where,
  Firestore,
  writeBatch,
  enableIndexedDbPersistence
} from 'firebase/firestore';
import { WithdrawalRecord, Publication } from '../types';

/**
 * 🛠️ إعدادات Firebase الجديدة (مربوطة بقاعدة بياناتك المحدثة)
 */
const firebaseConfig = {
  apiKey: "AIzaSyAKnoCa3sKwZrQaUXy0PNkJ1FbsJGAOyjk",
  authDomain: "studio-3236344976-c8013.firebaseapp.com",
  databaseURL: "https://studio-3236344976-c8013-default-rtdb.firebaseio.com",
  projectId: "studio-3236344976-c8013",
  storageBucket: "studio-3236344976-c8013.firebasestorage.app",
  messagingSenderId: "689062563273",
  appId: "1:689062563273:web:31e28523c69098e781ac18"
};

// 1. تهيئة التطبيق
let app: FirebaseApp;
try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
} catch (e) {
  console.error("Firebase App error:", e);
  app = {} as FirebaseApp;
}

// 2. تفعيل Firestore
let db_fs: Firestore;
try {
  db_fs = getFirestore(app);
  
  // تفعيل المزامنة المحلية إذا كان المتصفح يدعمها
  enableIndexedDbPersistence(db_fs).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn("Multiple tabs open, persistence can only be enabled in one tab at a time.");
    } else if (err.code === 'unimplemented') {
      console.warn("The current browser doesn't support all of the features needed to enable persistence");
    }
  });

  // اختبار الاتصال الأولي
  enableNetwork(db_fs).then(() => console.log("🔥 Firestore Connected to New Database Successfully"));
} catch (e) {
  console.error("Firestore initialization error:", e);
}

export const MIN_WITHDRAW_GEMS = 2000; 
export const GEMS_PER_DOLLAR = 100;

export interface UserDB {
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
}

class DatabaseService {
  private async ensureNetwork() {
    if (!db_fs) return;
    try {
      await enableNetwork(db_fs);
    } catch (e) {}
  }

  async clearAllData(): Promise<{success: boolean, message: string}> {
    if (!db_fs) return { success: false, message: "Service unavailable" };
    try {
      const collections = ['users', 'publications', 'transactions', 'platform'];
      const batch = writeBatch(db_fs);
      for (const col of collections) {
        const snap = await getDocs(collection(db_fs, col));
        snap.forEach(d => batch.delete(d.ref));
      }
      await batch.commit();
      await setDoc(doc(db_fs, 'platform', 'stats'), { revenue: 0, totalPayouts: 0, lastUpdate: Timestamp.now() });
      return { success: true, message: "تم مسح كافة البيانات من قاعدة البيانات الجديدة." };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }

  async calculateTotalRevenue(): Promise<number> {
    if (!db_fs) return 0;
    try {
      const q = query(collection(db_fs, 'transactions'), where("status", "==", "COMPLETED"));
      const snap = await getDocs(q);
      let total = 0;
      snap.forEach(d => total += (d.data().price || 0));
      await setDoc(doc(db_fs, 'platform', 'stats'), { revenue: total }, { merge: true });
      return total;
    } catch (e) { return 0; }
  }

  async getUser(email: string): Promise<UserDB | null> {
    if (!email || !db_fs) return null;
    try {
      const snap = await getDoc(doc(db_fs, 'users', email.toLowerCase().trim()));
      return snap.exists() ? snap.data() as UserDB : null;
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
    const email = user.email.toLowerCase().trim();
    const userRef = doc(db_fs, 'users', email);
    try {
      const existing = await this.getUser(email);
      const data = {
        ...user,
        email,
        joinedAt: existing?.joinedAt || new Date().toISOString(),
        diamonds: user.diamonds ?? existing?.diamonds ?? 50,
        role: user.role || existing?.role || 'doll'
      };
      await setDoc(userRef, data, { merge: true });
      return data;
    } catch (e) { return user; }
  }

  async getPlatformStats() {
    if (!db_fs) return { revenue: 0, totalPayouts: 0, userCount: 0, liabilityUsd: 0, dollCount: 0, mentorCount: 0 };
    try {
      const revenue = await this.calculateTotalRevenue();
      const statsSnap = await getDoc(doc(db_fs, 'platform', 'stats'));
      const stats = statsSnap.data() || {};
      const users = await this.getAllUsers();
      return {
        revenue,
        totalPayouts: stats.totalPayouts || 0,
        userCount: users.length,
        liabilityUsd: users.reduce((s, u) => s + (u.diamonds || 0), 0) / GEMS_PER_DOLLAR,
        dollCount: users.filter(u => u.role === 'doll').length,
        mentorCount: users.filter(u => u.role === 'mentor').length,
      };
    } catch (e) { return { revenue: 0, totalPayouts: 0, userCount: 0, liabilityUsd: 0, dollCount: 0, mentorCount: 0 }; }
  }

  async capturePaypalOrder(orderID: string, userEmail: string, diamondAmount: number, price: number): Promise<{success: boolean, message: string}> {
    if (!db_fs) return { success: false, message: "Offline" };
    try {
      await setDoc(doc(db_fs, 'transactions', orderID), { 
        userEmail: userEmail.toLowerCase(), 
        diamondAmount, 
        price, 
        timestamp: Timestamp.now(), 
        status: 'COMPLETED' 
      });
      await updateDoc(doc(db_fs, 'users', userEmail.toLowerCase()), { diamonds: increment(diamondAmount) });
      return { success: true, message: "Success" };
    } catch (e) { return { success: false, message: "Failed" }; }
  }

  async requestWithdrawal(userEmail: string, paypalEmail: string, gems: number): Promise<{success: boolean, message: string}> {
    if (!db_fs) return { success: false, message: "Offline" };
    try {
      const amountUsd = gems / GEMS_PER_DOLLAR;
      const record = { id: `W_${Date.now()}`, amountUsd, gemsConverted: gems, paypalEmail, status: 'completed', timestamp: new Date().toISOString() };
      await updateDoc(doc(db_fs, 'users', userEmail.toLowerCase()), {
        diamonds: increment(-gems),
        withdrawals: arrayUnion(record)
      });
      await setDoc(doc(db_fs, 'platform', 'stats'), { totalPayouts: increment(amountUsd) }, { merge: true });
      return { success: true, message: "Success" };
    } catch (e) { return { success: false, message: "Failed" }; }
  }

  subscribeToFeed(callback: (pubs: Publication[]) => void) {
    if (!db_fs) return () => {};
    const q = query(collection(db_fs, 'publications'), orderBy('timestamp', 'desc'), limit(50));
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ ...d.data(), timestamp: (d.data().timestamp as Timestamp)?.toDate() || new Date() } as Publication)));
    });
  }

  async addPublication(pub: Publication): Promise<void> {
    if (!db_fs) return;
    await setDoc(doc(db_fs, 'publications', pub.id), { ...pub, timestamp: Timestamp.now() });
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

  async getPlatformRevenue(): Promise<number> {
    return this.calculateTotalRevenue();
  }

  async toggleUserStatus(email: string): Promise<void> {
    if (!db_fs) return;
    const user = await this.getUser(email);
    if (user) await updateDoc(doc(db_fs, 'users', email.toLowerCase()), { status: user.status === 'banned' ? 'active' : 'banned' });
  }

  async deleteUser(email: string): Promise<void> {
    if (!db_fs) return;
    await deleteDoc(doc(db_fs, 'users', email.toLowerCase()));
  }

  async getAllWithdrawals(): Promise<any[]> {
    if (!db_fs) return [];
    const users = await this.getAllUsers();
    let all: any[] = [];
    users.forEach(u => u.withdrawals && all.push(...u.withdrawals.map(w => ({ ...w, userEmail: u.email, userName: u.name }))));
    return all.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

export const db = new DatabaseService();
