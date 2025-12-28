
import { WithdrawalRecord, Publication } from '../types';

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
}

class DatabaseService {
  private data: { users: Record<string, UserDB>; platform: PlatformDB };

  constructor() {
    const saved = localStorage.getItem(DB_NAME);
    if (saved) {
      this.data = JSON.parse(saved);
      if (!this.data.platform.globalPublications) {
        this.data.platform.globalPublications = [];
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
            country: 'Global'
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
          globalPublications: [
            {
              id: 'init-1',
              user: 'AlphaStreamer',
              userAvatar: 'https://ui-avatars.com/api/?name=AlphaStreamer&background=a855f7&color=fff',
              type: 'image',
              content: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
              description: 'Check out my new gaming setup! 🚀',
              likes: 124,
              dislikes: 2,
              comments: [{ id: 'c1', user: 'TechGuru', text: 'Clean setup, man!', timestamp: new Date() }],
              timestamp: new Date(Date.now() - 3600000)
            }
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
    return Object.values(this.data.users);
  }

  async upsertUser(user: UserDB): Promise<UserDB> {
    this.data.users[user.email] = user;
    this.save();
    return user;
  }

  async getPlatformRevenue(): Promise<number> {
    return this.data.platform.revenue;
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

  async updatePublication(updatedPub: Publication): Promise<void> {
    this.data.platform.globalPublications = this.data.platform.globalPublications.map(p => 
      p.id === updatedPub.id ? updatedPub : p
    );
    this.save();
  }

  async getPlatformStats() {
    return {
      revenue: this.data.platform.revenue,
      totalPayouts: this.data.platform.totalPayouts,
      merchantId: this.data.platform.merchantConfig.clientId,
      isLive: this.data.platform.merchantConfig.isLive
    };
  }

  async capturePaypalOrder(orderID: string, userEmail: string, diamondAmount: number, price: number): Promise<{success: boolean, message: string}> {
    if (this.data.platform.transactions.includes(orderID)) {
      return { success: false, message: "Transaction already processed." };
    }

    try {
      await new Promise(r => setTimeout(r, 2000));
      this.data.platform.revenue += price;
      this.data.platform.transactions.push(orderID);

      const user = this.data.users[userEmail];
      if (user) {
        user.diamonds += diamondAmount;
      }

      this.save();
      return { 
        success: true, 
        message: "Payment captured successfully! Credits added." 
      };
    } catch (error) {
      return { success: false, message: "Error confirming payment." };
    }
  }

  async requestWithdrawal(userEmail: string, paypalEmail: string, gemsToConvert: number): Promise<{success: boolean, message: string}> {
    const user = this.data.users[userEmail];
    if (!user) return { success: false, message: "User not found." };
    
    if (user.diamonds < gemsToConvert) {
      return { success: false, message: "Insufficient diamond balance." };
    }

    const amountUsd = gemsToConvert / 100;
    try {
      await new Promise(r => setTimeout(r, 1200));
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
      return { success: true, message: "Withdrawal completed successfully." };
    } catch (error) {
      return { success: false, message: "Payout failed." };
    }
  }
}

export const db = new DatabaseService();
