
import { WithdrawalRecord, Publication, AdConfig } from '../types';

const DB_NAME = 'mydoll_cloud_db_v3';

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

export interface PlatformDB {
  revenue: number;
  totalPayouts: number;
  transactions: string[]; 
  merchantConfig: {
    clientId: string;
    clientSecret: string;
    isLive: boolean;
  };
  globalPublications: Publication[];
  ads: AdConfig[];
}

class DatabaseService {
  private data: { users: Record<string, UserDB>; platform: PlatformDB };

  constructor() {
    const saved = localStorage.getItem(DB_NAME);
    if (saved) {
      this.data = JSON.parse(saved);
      if (!this.data.platform.globalPublications) this.data.platform.globalPublications = [];
      if (!this.data.platform.ads) {
        this.data.platform.ads = [
          { id: '1', placement: 'under_header', enabled: true, title: 'Luxury Watches', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80', link: '#' },
        ];
      }
    } else {
      this.data = {
        users: {
          'admin@mydoll.club': {
            name: 'Wahab Fresh',
            email: 'admin@mydoll.club',
            diamonds: 99999,
            usd_balance: 5420.50,
            withdrawals: [],
            album: [],
            bio: 'Master Node Administrator',
            avatar: 'https://ui-avatars.com/api/?name=Wahab+Fresh&background=0891b2&color=fff',
            cover: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1200&q=80',
            gender: 'men',
            country: 'Global',
            referralCount: 0,
            status: 'active',
            role: 'admin',
            joinedAt: new Date().toISOString()
          }
        },
        platform: { 
          revenue: 12450.75, 
          totalPayouts: 2150.00,
          transactions: [],
          merchantConfig: {
            clientId: "AchOwxrubWXLdT64U9AmBydM9n7EEgA_psh3nXWi0PPhRvxZRtdHNCpXYxggnKV-dMef3JGMMzdeGvEW",
            clientSecret: "EP_y5ZbwgqdVgJ4GJAx1TTIFiHgn_g47xviitWpoCcX9crWi8uEwVjUqtrdlBDU3aTO6DSEEsUwqHb3b",
            isLive: true
          },
          globalPublications: [],
          ads: [
            { id: '1', placement: 'under_header', enabled: true, title: 'Elite Rewards', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80', link: '#' },
          ]
        }
      };
      this.save();
    }
  }

  private save() {
    localStorage.setItem(DB_NAME, JSON.stringify(this.data));
  }

  async getUser(email: string): Promise<UserDB | null> {
    return this.data.users[email] || null;
  }

  async getAllUsers(): Promise<UserDB[]> {
    return Object.values(this.data.users).sort((a, b) => 
      new Date(b.joinedAt || 0).getTime() - new Date(a.joinedAt || 0).getTime()
    );
  }

  async deleteUser(email: string): Promise<void> {
    if (email === 'admin@mydoll.club') return;
    delete this.data.users[email];
    this.save();
  }

  async upsertUser(user: UserDB): Promise<UserDB> {
    const isNew = !this.data.users[user.email];
    if (isNew) {
      user.joinedAt = user.joinedAt || new Date().toISOString();
      user.status = user.status || 'active';
      user.role = user.role || (user.gender === 'women' ? 'doll' : 'mentor');
    }
    this.data.users[user.email] = {
      ...this.data.users[user.email],
      ...user
    };
    this.save();
    return this.data.users[user.email];
  }

  async toggleUserStatus(email: string): Promise<void> {
    const user = this.data.users[email];
    if (user) {
      user.status = user.status === 'banned' ? 'active' : 'banned';
      this.save();
    }
  }

  async getPlatformRevenue(): Promise<number> {
    return this.data.platform.revenue;
  }

  async getAds(): Promise<AdConfig[]> {
    return this.data.platform.ads;
  }

  async updateAdConfig(updatedAd: AdConfig): Promise<void> {
    const exists = this.data.platform.ads.find(a => a.id === updatedAd.id);
    if (exists) {
      this.data.platform.ads = this.data.platform.ads.map(a => 
        a.id === updatedAd.id ? updatedAd : a
      );
    } else {
      this.data.platform.ads.push(updatedAd);
    }
    this.save();
  }

  async deleteAd(id: string): Promise<void> {
    this.data.platform.ads = this.data.platform.ads.filter(a => a.id !== id);
    this.save();
  }

  async getGlobalPublications(): Promise<Publication[]> {
    return [...this.data.platform.globalPublications].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async addPublication(pub: Publication): Promise<void> {
    this.data.platform.globalPublications.unshift(pub);
    this.save();
  }

  // Fix: Implemented missing updatePublication method to resolve errors in FeedPage.tsx
  async updatePublication(updatedPub: Publication): Promise<void> {
    this.data.platform.globalPublications = this.data.platform.globalPublications.map(p => 
      p.id === updatedPub.id ? updatedPub : p
    );
    this.save();
  }

  async getPlatformStats() {
    const users = Object.values(this.data.users);
    const totalDiamondsInSystem = users.reduce((sum, u) => sum + u.diamonds, 0);
    return {
      revenue: this.data.platform.revenue,
      totalPayouts: this.data.platform.totalPayouts,
      merchantId: this.data.platform.merchantConfig.clientId,
      isLive: this.data.platform.merchantConfig.isLive,
      userCount: users.length,
      liabilityUsd: totalDiamondsInSystem / 100,
      dollCount: users.filter(u => u.role === 'doll').length,
      mentorCount: users.filter(u => u.role === 'mentor').length,
    };
  }

  async capturePaypalOrder(orderID: string, userEmail: string, diamondAmount: number, price: number): Promise<{success: boolean, message: string}> {
    if (this.data.platform.transactions.includes(orderID)) {
      return { success: false, message: "Transaction already processed." };
    }
    this.data.platform.revenue += price;
    this.data.platform.transactions.push(orderID);
    const user = this.data.users[userEmail];
    if (user) user.diamonds += diamondAmount;
    this.save();
    return { success: true, message: "Payment captured successfully!" };
  }

  async requestWithdrawal(userEmail: string, paypalEmail: string, gemsToConvert: number): Promise<{success: boolean, message: string}> {
    const user = this.data.users[userEmail];
    if (!user || user.diamonds < gemsToConvert) return { success: false, message: "Insufficient balance." };
    const amountUsd = gemsToConvert / 100;
    user.diamonds -= gemsToConvert;
    this.data.platform.totalPayouts += amountUsd;
    const record: WithdrawalRecord = {
      id: `WTHDRW_${Date.now()}`,
      amountUsd,
      gemsConverted: gemsToConvert,
      paypalEmail,
      status: 'completed',
      timestamp: new Date()
    };
    user.withdrawals = [record, ...(user.withdrawals || [])];
    this.save();
    return { success: true, message: "Withdrawal completed." };
  }
}

export const db = new DatabaseService();
