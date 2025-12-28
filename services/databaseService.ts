
import { initializeApp } from 'firebase/app';
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
  where,
  Timestamp,
  limit
} from 'firebase/firestore';
import { WithdrawalRecord, Publication, AdConfig } from '../types';

// NOTE: Replace these placeholder values with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyAs-REPLACE_WITH_YOUR_KEY",
  authDomain: "mydoll-elite.firebaseapp.com",
  projectId: "mydoll-elite",
  storageBucket: "mydoll-elite.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
const db_fs = getFirestore(app);

export const MIN_WITHDRAW_USD = 20;
export const GEMS_PER_DOLLAR = 100;

export interface AlbumPhoto {
  id: string;
  url: string;
  price: number;
  caption?: string;
}

export interface UserDB {
  name: string;
  email: string;
  diamonds: number;
  usd_balance: number; 
  withdrawals: WithdrawalRecord[];
  album: AlbumPhoto[];
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
  async getUser(email: string): Promise<UserDB | null> {
    const userRef = doc(db_fs, 'users', email.toLowerCase());
    const snap = await getDoc(userRef);
    if (snap.exists()) return snap.data() as UserDB;
    return null;
  }

  async getAllUsers(): Promise<UserDB[]> {
    const q = query(collection(db_fs, 'users'), orderBy('joinedAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as UserDB);
  }

  async upsertUser(user: UserDB): Promise<UserDB> {
    const userRef = doc(db_fs, 'users', user.email.toLowerCase());
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
  }

  async toggleUserStatus(email: string): Promise<void> {
    const user = await this.getUser(email);
    if (user) {
      const userRef = doc(db_fs, 'users', email.toLowerCase());
      await updateDoc(userRef, {
        status: user.status === 'banned' ? 'active' : 'banned'
      });
    }
  }

  async deleteUser(email: string): Promise<void> {
    if (email.toLowerCase() === 'admin@mydoll.club') return;
    await deleteDoc(doc(db_fs, 'users', email.toLowerCase()));
  }

  async getPlatformRevenue(): Promise<number> {
    const statsRef = doc(db_fs, 'platform', 'stats');
    const snap = await getDoc(statsRef);
    return snap.exists() ? snap.data().revenue : 0;
  }

  async getPlatformStats() {
    const statsRef = doc(db_fs, 'platform', 'stats');
    const snap = await getDoc(statsRef);
    const users = await this.getAllUsers();
    const totalDiamonds = users.reduce((sum, u) => sum + (u.diamonds || 0), 0);
    
    const data = snap.exists() ? snap.data() : { revenue: 0, totalPayouts: 0 };
    
    return {
      revenue: data.revenue,
      totalPayouts: data.totalPayouts,
      userCount: users.length,
      liabilityUsd: totalDiamonds / GEMS_PER_DOLLAR,
      dollCount: users.filter(u => u.role === 'doll').length,
      mentorCount: users.filter(u => u.role === 'mentor').length,
    };
  }

  async capturePaypalOrder(orderID: string, userEmail: string, diamondAmount: number, price: number): Promise<{success: boolean, message: string}> {
    const txRef = doc(db_fs, 'transactions', orderID);
    const txSnap = await getDoc(txRef);
    
    if (txSnap.exists()) {
      return { success: false, message: "Transaction already processed." };
    }

    // Atomic update
    await setDoc(txRef, { userEmail, diamondAmount, price, timestamp: Timestamp.now() });
    
    const statsRef = doc(db_fs, 'platform', 'stats');
    await setDoc(statsRef, { revenue: increment(price) }, { merge: true });

    const userRef = doc(db_fs, 'users', userEmail.toLowerCase());
    await updateDoc(userRef, {
      diamonds: increment(diamondAmount)
    });

    return { success: true, message: "Payment captured successfully!" };
  }

  async requestWithdrawal(userEmail: string, paypalEmail: string, gemsToConvert: number): Promise<{success: boolean, message: string}> {
    const user = await this.getUser(userEmail);
    if (!user) return { success: false, message: "User not found." };
    
    const minGemsRequired = MIN_WITHDRAW_USD * GEMS_PER_DOLLAR;
    if (gemsToConvert < minGemsRequired) {
      return { success: false, message: `Minimum withdrawal is $${MIN_WITHDRAW_USD}.` };
    }

    if (user.diamonds < gemsToConvert) {
      return { success: false, message: "Insufficient balance." };
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

    return { success: true, message: "Withdrawal completed." };
  }

  // Real-time Feed & Publications
  async getGlobalPublications(): Promise<Publication[]> {
    const q = query(collection(db_fs, 'publications'), orderBy('timestamp', 'desc'), limit(50));
    const snap = await getDocs(q);
    return snap.docs.map(d => {
      const data = d.data();
      return {
        ...data,
        timestamp: data.timestamp?.toDate() || new Date()
      } as Publication;
    });
  }

  async addPublication(pub: Publication): Promise<void> {
    const pubRef = doc(db_fs, 'publications', pub.id);
    await setDoc(pubRef, {
      ...pub,
      timestamp: Timestamp.now()
    });
  }

  async updatePublication(updatedPub: Publication): Promise<void> {
    const pubRef = doc(db_fs, 'publications', updatedPub.id);
    await updateDoc(pubRef, {
      likes: updatedPub.likes,
      dislikes: updatedPub.dislikes,
      comments: updatedPub.comments
    });
  }

  subscribeToFeed(callback: (pubs: Publication[]) => void) {
    const q = query(collection(db_fs, 'publications'), orderBy('timestamp', 'desc'), limit(50));
    return onSnapshot(q, (snap) => {
      const pubs = snap.docs.map(d => {
        const data = d.data();
        return {
          ...data,
          timestamp: data.timestamp?.toDate() || new Date()
        } as Publication;
      });
      callback(pubs);
    });
  }

  async getAds(): Promise<AdConfig[]> {
    const snap = await getDocs(collection(db_fs, 'ads'));
    return snap.docs.map(d => d.data() as AdConfig);
  }

  async updateAdConfig(ad: AdConfig): Promise<void> {
    await setDoc(doc(db_fs, 'ads', ad.id), ad, { merge: true });
  }

  async deleteAd(id: string): Promise<void> {
    await deleteDoc(doc(db_fs, 'ads', id));
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

  async resetAllWallets(): Promise<void> {
    const users = await this.getAllUsers();
    for (const u of users) {
      await updateDoc(doc(db_fs, 'users', u.email.toLowerCase()), {
        diamonds: 0,
        usd_balance: 0,
        withdrawals: []
      });
    }
    await setDoc(doc(db_fs, 'platform', 'stats'), { revenue: 0, totalPayouts: 0 });
  }
}

export const db = new DatabaseService();
