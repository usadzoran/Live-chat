
import { initializeApp, getApp, getApps } from 'firebase/app';
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
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  enableNetwork,
  where
} from 'firebase/firestore';
import { WithdrawalRecord, Publication } from '../types';

/**
 * 🛠️ Firebase Configuration for My Doll Elite (Studio Project)
 */
const firebaseConfig = {
  apiKey: "AIzaSyAKnoCa3sKwZrQaUXy0PNkJ1FbsJGAOyjk",
  authDomain: "studio-3236344976-c8013.firebaseapp.com",
  databaseURL: "https://studio-3236344976-c8013-default-rtdb.firebaseio.com",
  projectId: "studio-3236344976-c8013",
  storageBucket: "studio-3236344976-c8013.firebasestorage.app",
  messagingSenderId: "689062563273",
  appId: "1:689062563273:web:7cfa6fdd7ad7455a81ac18"
};

// Initialize App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with explicit app attachment to fix "Component not registered" error
const db_fs = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

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
    try {
      await enableNetwork(db_fs);
    } catch (e) {
      // Network already active
    }
  }

  private handleError(error: any, context: string) {
    console.error(`Firebase [${context}]:`, error.message || error);
  }

  async calculateTotalRevenue(): Promise<number> {
    await this.ensureNetwork();
    try {
      const txRef = collection(db_fs, 'transactions');
      const q = query(txRef, where("status", "==", "COMPLETED"));
      const snap = await getDocs(q);
      
      let total = 0;
      snap.forEach((doc) => {
        const data = doc.data();
        total += data.price || 0; 
      });

      const statsRef = doc(db_fs, 'platform', 'stats');
      await setDoc(statsRef, { revenue: total }, { merge: true });
      
      return total;
    } catch (e) {
      this.handleError(e, 'calculateTotalRevenue');
      return 0;
    }
  }

  async getUser(email: string): Promise<UserDB | null> {
    if (!email) return null;
    await this.ensureNetwork();
    try {
      const userRef = doc(db_fs, 'users', email.toLowerCase());
      const snap = await getDoc(userRef);
      if (snap.exists()) return snap.data() as UserDB;
    } catch (e) {
      this.handleError(e, 'getUser');
    }
    return null;
  }

  async getAllUsers(): Promise<UserDB[]> {
    await this.ensureNetwork();
    try {
      const q = query(collection(db_fs, 'users'), orderBy('joinedAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data() as UserDB);
    } catch (e) {
      this.handleError(e, 'getAllUsers');
      return [];
    }
  }

  async upsertUser(user: UserDB): Promise<UserDB> {
    const userRef = doc(db_fs, 'users', user.email.toLowerCase());
    try {
      const existing = await this.getUser(user.email);
      const data = {
        ...user,
        joinedAt: existing?.joinedAt || new Date().toISOString(),
        status: user.status || existing?.status || 'active',
        role: user.role || existing?.role || (user.gender === 'women' ? 'doll' : 'mentor'),
        diamonds: user.diamonds ?? existing?.diamonds ?? 50,
        usd_balance: user.usd_balance ?? existing?.usd_balance ?? 0,
        withdrawals: user.withdrawals || existing?.withdrawals || [],
        album: user.album || existing?.album || []
      };
      await setDoc(userRef, data, { merge: true });
      return data;
    } catch (e) {
      this.handleError(e, 'upsertUser');
      return user;
    }
  }

  async getPlatformRevenue(): Promise<number> {
    return await this.calculateTotalRevenue();
  }

  async getPlatformStats() {
    await this.ensureNetwork();
    try {
      const revenue = await this.calculateTotalRevenue();
      const statsRef = doc(db_fs, 'platform', 'stats');
      const statsSnap = await getDoc(statsRef);
      
      const users = await this.getAllUsers();
      const totalDiamonds = users.reduce((sum, u) => sum + (u.diamonds || 0), 0);
      const data = statsSnap.data() || { totalPayouts: 0 };
      
      return {
        revenue: revenue,
        totalPayouts: data.totalPayouts || 0,
        userCount: users.length,
        liabilityUsd: totalDiamonds / GEMS_PER_DOLLAR,
        dollCount: users.filter(u => u.role === 'doll').length,
        mentorCount: users.filter(u => u.role === 'mentor').length,
      };
    } catch (e) {
      return { revenue: 0, totalPayouts: 0, userCount: 0, liabilityUsd: 0, dollCount: 0, mentorCount: 0 };
    }
  }

  async capturePaypalOrder(orderID: string, userEmail: string, diamondAmount: number, price: number): Promise<{success: boolean, message: string}> {
    try {
      const txRef = doc(db_fs, 'transactions', orderID);
      await setDoc(txRef, { 
        userEmail, 
        diamondAmount, 
        price, 
        timestamp: Timestamp.now(), 
        status: 'COMPLETED' 
      });
      
      const userRef = doc(db_fs, 'users', userEmail.toLowerCase());
      await updateDoc(userRef, { diamonds: increment(diamondAmount) });

      return { success: true, message: "تم شحن الجواهر بنجاح!" };
    } catch (e) {
      this.handleError(e, 'capturePaypalOrder');
      return { success: false, message: "خطأ في الاتصال بالسحابة." };
    }
  }

  async requestWithdrawal(userEmail: string, paypalEmail: string, gemsToConvert: number): Promise<{success: boolean, message: string}> {
    try {
      const user = await this.getUser(userEmail);
      if (!user) return { success: false, message: "المستخدم غير موجود." };
      
      if (gemsToConvert < MIN_WITHDRAW_GEMS) {
        return { success: false, message: `الحد الأدنى للسحب هو ${MIN_WITHDRAW_GEMS} جوهرة ($20).` };
      }

      if (user.diamonds < gemsToConvert) {
        return { success: false, message: "رصيد الجواهر غير كافٍ." };
      }

      const amountUsd = gemsToConvert / GEMS_PER_DOLLAR;
      const record: WithdrawalRecord = {
        id: `WTHDRW_${Date.now()}`,
        amountUsd,
        gemsConverted: gemsToConvert,
        paypalEmail,
        status: 'completed',
        timestamp: new Date()
      };

      const userRef = doc(db_fs, 'users', userEmail.toLowerCase());
      await updateDoc(userRef, {
        diamonds: increment(-gemsToConvert),
        withdrawals: arrayUnion(record)
      });

      const statsRef = doc(db_fs, 'platform', 'stats');
      await setDoc(statsRef, { totalPayouts: increment(amountUsd) }, { merge: true });

      return { success: true, message: "تم تقديم طلب السحب بنجاح!" };
    } catch (e) {
      this.handleError(e, 'requestWithdrawal');
      return { success: false, message: "حدث خطأ في معالجة الطلب." };
    }
  }

  subscribeToFeed(callback: (pubs: Publication[]) => void) {
    const q = query(collection(db_fs, 'publications'), orderBy('timestamp', 'desc'), limit(50));
    return onSnapshot(q, (snap) => {
      const pubs = snap.docs.map(d => ({ ...d.data(), timestamp: d.data().timestamp?.toDate() || new Date() } as Publication));
      callback(pubs);
    }, (error) => {
      this.handleError(error, 'subscribeToFeed');
      callback([]);
    });
  }

  async addPublication(pub: Publication): Promise<void> {
    const pubRef = doc(db_fs, 'publications', pub.id);
    await setDoc(pubRef, { ...pub, timestamp: Timestamp.now() });
  }

  async updatePublication(updatedPub: Publication): Promise<void> {
    const pubRef = doc(db_fs, 'publications', updatedPub.id);
    await updateDoc(pubRef, { likes: updatedPub.likes, dislikes: updatedPub.dislikes, comments: updatedPub.comments });
  }

  async toggleUserStatus(email: string): Promise<void> {
    const user = await this.getUser(email);
    if (user) {
      const userRef = doc(db_fs, 'users', email.toLowerCase());
      await updateDoc(userRef, { status: user.status === 'banned' ? 'active' : 'banned' });
    }
  }

  async deleteUser(email: string): Promise<void> {
    await deleteDoc(doc(db_fs, 'users', email.toLowerCase()));
  }

  async getAllWithdrawals(): Promise<any[]> {
    const users = await this.getAllUsers();
    let all: any[] = [];
    users.forEach(u => {
      if (u.withdrawals) {
        all = [...all, ...u.withdrawals.map(w => ({ ...w, userEmail: u.email, userName: u.name }))];
      }
    });
    return all.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

export const db = new DatabaseService();
