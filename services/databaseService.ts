
const DB_NAME = 'mydoll_cloud_db';

export interface UserDB {
  name: string;
  email: string;
  diamonds: number;
  bio?: string;
  avatar?: string;
  cover?: string;
}

export interface PlatformDB {
  revenue: number;
  transactions: string[]; // OrderIDs
}

class DatabaseService {
  private data: { users: Record<string, UserDB>; platform: PlatformDB };

  constructor() {
    const saved = localStorage.getItem(DB_NAME);
    if (saved) {
      this.data = JSON.parse(saved);
    } else {
      this.data = {
        users: {},
        platform: { revenue: 842500, transactions: [] }
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

  async upsertUser(user: UserDB): Promise<UserDB> {
    this.data.users[user.email] = user;
    this.save();
    return user;
  }

  async getPlatformRevenue(): Promise<number> {
    return this.data.platform.revenue;
  }

  /**
   * Simulated Server-Side Capture Logic
   * Verified money reaching admin wallet and grants diamonds
   */
  async capturePayment(orderID: string, userEmail: string, diamondAmount: number, price: number): Promise<boolean> {
    // 1. Prevent Replay Attack (Check if orderID already used)
    if (this.data.platform.transactions.includes(orderID)) {
      console.error("Transaction already processed");
      return false;
    }

    // 2. Simulate Delay for External Verification
    await new Promise(r => setTimeout(r, 2000));

    // 3. Update Admin Wallet
    this.data.platform.revenue += price;
    this.data.platform.transactions.push(orderID);

    // 4. Update User Diamonds
    const user = this.data.users[userEmail];
    if (user) {
      user.diamonds += diamondAmount;
    }

    this.save();
    return true;
  }
}

export const db = new DatabaseService();
