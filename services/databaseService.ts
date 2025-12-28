
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

/**
 * IMPORTANT: To fix [permission-denied] errors:
 * 1. Go to your Firebase Console (https://console.firebase.google.com/)
 * 2. Select project "mydoll-elite"
 * 3. Go to "Firestore Database" -> "Rules" tab
 * 4. Change rules to:
 *    service cloud.firestore {
 *      match /databases/{database}/documents {
 *        match /{document=**} {
 *          allow read, write: if true;
 *        }
 *      }
 *    }
 * 5. Ensure your apiKey below matches the one in "Project Settings".
 */

const firebaseConfig = {
  apiKey: "AIzaSyAs-REPLACE_WITH_YOUR_ACTUAL_KEY",
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
  private handleError(error: any, context: string) {
    console.error(`Database Error in ${context}:`, error);
    if (error.code === 'permission-denied') {
      console.warn("CRITICAL: Permission denied. Please check your Firestore Security Rules in the Firebase Console.");
    }
  }

  async getUser(email: string): Promise<UserDB | null> {
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

  async toggleUserStatus(email: string): Promise<void> {
    try {
      const user = await this.getUser(email);
      if (user) {
        const userRef = doc(db_fs, 'users', email.toLowerCase());
        await updateDoc(userRef, {
          status: user.status === 'banned' ? 'active' : 'banned'
        });
      }
    } catch (e) {
      this.handleError(e, 'toggleUserStatus');
    }
  }

  async deleteUser(email: string): Promise<void> {
    if (email.toLowerCase() === 'admin@mydoll.club') return;
    try {
      await deleteDoc(doc(db_fs, 'users', email.toLowerCase()));
    } catch (e) {
      this.handleError(e, 'deleteUser');
    }
  }

  async getPlatformRevenue(): Promise<number> {
    try {
      const statsRef = doc(db_fs, 'platform', 'stats');
      const snap = await getDoc(statsRef);
      return snap.exists() ? (snap.data().revenue || 0) : 0;
    } catch (e) {
      this.handleError(e, 'getPlatformRevenue');
      return 0;
    }
  }

  async getPlatformStats() {
    try {
      const statsRef = doc(db_fs, 'platform', 'stats');
      const snap = await getDoc(statsRef);
      const users = await this.getAllUsers();
      const totalDiamonds = users.reduce((sum, u) => sum + (u.diamonds || 0), 0);
      const data = snap.exists() ? snap.data() : { revenue: 0, totalPayouts: 0 };
      
      return {
        revenue: data.revenue || 0,
        totalPayouts: data.totalPayouts || 0,
        userCount: users.length,
        liabilityUsd: totalDiamonds / GEMS_PER_DOLLAR,
        dollCount: users.filter(u => u.role === 'doll').length,
        mentorCount: users.filter(u => u.role === 'mentor').length,
      };
    } catch (e) {
      this.handleError(e, 'getPlatformStats');
      return { revenue: 0, totalPayouts: 0, userCount: 0, liabilityUsd: 0, dollCount: 0, mentorCount: 0 };
    }
  }

  async capturePaypalOrder(orderID: string, userEmail: string, diamondAmount: number, price: number): Promise<{success: boolean, message: string}> {
    try {
      const txRef = doc(db_fs, 'transactions', orderID);
      const txSnap = await getDoc(txRef);
      
      if (txSnap.exists()) {
        return { success: false, message: "Transaction already processed." };
      }

      await setDoc(txRef, { userEmail, diamondAmount, price, timestamp: Timestamp.now() });
      const statsRef = doc(db_fs, 'platform', 'stats');
      await setDoc(statsRef, { revenue: increment(price) }, { merge: true });
      const userRef = doc(db_fs, 'users', userEmail.toLowerCase());
      await updateDoc(userRef, { diamonds: increment(diamondAmount) });

      return { success: true, message: "Payment captured successfully!" };
    } catch (e) {
      this.handleError(e, 'capturePaypalOrder');
      return { success: false, message: "Payment failed due to database permission issues." };
    }
  }

  async requestWithdrawal(userEmail: string, paypalEmail: string, gemsToConvert: number): Promise<{success: boolean, message: string}> {
    try {
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
    } catch (e) {
      this.handleError(e, 'requestWithdrawal');
      return { success: false, message: "Transaction failed. Please check platform permissions." };
    }
  }

  async getGlobalPublications(): Promise<Publication[]> {
    try {
      const q = query(collection(db_fs, 'publications'), orderBy('timestamp', 'desc'), limit(50));
      const snap = await getDocs(q);
      return snap.docs.map(d => {
        const data = d.data();
        return {
          ...data,
          timestamp: data.timestamp?.toDate() || new Date()
        } as Publication;
      });
    } catch (e) {
      this.handleError(e, 'getGlobalPublications');
      return [];
    }
  }

  async addPublication(pub: Publication): Promise<void> {
    try {
      const pubRef = doc(db_fs, 'publications', pub.id);
      await setDoc(pubRef, {
        ...pub,
        timestamp: Timestamp.now()
      });
    } catch (e) {
      this.handleError(e, 'addPublication');
    }
  }

  async updatePublication(updatedPub: Publication): Promise<void> {
    try {
      const pubRef = doc(db_fs, 'publications', updatedPub.id);
      await updateDoc(pubRef, {
        likes: updatedPub.likes,
        dislikes: updatedPub.dislikes,
        comments: updatedPub.comments
      });
    } catch (e) {
      this.handleError(e, 'updatePublication');
    }
  }

  subscribeToFeed(callback: (pubs: Publication[]) => void) {
    try {
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
      }, (error) => {
        this.handleError(error, 'subscribeToFeed');
      });
    } catch (e) {
      this.handleError(e, 'subscribeToFeedInit');
      return () => {};
    }
  }

  async getAds(): Promise<AdConfig[]> {
    try {
      const snap = await getDocs(collection(db_fs, 'ads'));
      return snap.docs.map(d => d.data() as AdConfig);
    } catch (e) {
      this.handleError(e, 'getAds');
      return [];
    }
  }

  async updateAdConfig(ad: AdConfig): Promise<void> {
    try {
      await setDoc(doc(db_fs, 'ads', ad.id), ad, { merge: true });
    } catch (e) {
      this.handleError(e, 'updateAdConfig');
    }
  }

  async deleteAd(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db_fs, 'ads', id));
    } catch (e) {
      this.handleError(e, 'deleteAd');
    }
  }

  async getAllWithdrawals(): Promise<any[]> {
    try {
      const users = await this.getAllUsers();
      let all: any[] = [];
      users.forEach(u => {
        if (u.withdrawals) {
          all = [...all, ...u.withdrawals.map(w => ({ ...w, userEmail: u.email, userName: u.name }))];
        }
      });
      return all.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (e) {
      this.handleError(e, 'getAllWithdrawals');
      return [];
    }
  }

  async resetAllWallets(): Promise<void> {
    try {
      const users = await this.getAllUsers();
      for (const u of users) {
        await updateDoc(doc(db_fs, 'users', u.email.toLowerCase()), {
          diamonds: 0,
          usd_balance: 0,
          withdrawals: []
        });
      }
      await setDoc(doc(db_fs, 'platform', 'stats'), { revenue: 0, totalPayouts: 0 });
    } catch (e) {
      this.handleError(e, 'resetAllWallets');
    }
  }
}

export const db = new DatabaseService();
