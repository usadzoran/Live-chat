
export interface ChatMessage {
  id: string;
  sender: 'user' | 'gemini';
  text: string;
  timestamp: Date;
  isGift?: boolean;
  giftIcon?: string;
  giftName?: string;
  giftValue?: number;
}

export interface Gift {
  id: string;
  name: string;
  icon: string;
  cost: number;
  color: string;
}

export enum StreamStatus {
  IDLE = 'IDLE',
  CONNECTING = 'CONNECTING',
  LIVE = 'LIVE',
  ERROR = 'ERROR'
}

export type ViewType = 'stream' | 'profile' | 'feed';

export interface PayoutSettings {
  method: 'paypal' | 'card' | null;
  paypalEmail: string;
  cardNumber: string;
  cardExpiry: string;
  cardHolder: string;
}

export interface Comment {
  id: string;
  user: string;
  text: string;
  timestamp: Date;
}

export interface Publication {
  id: string;
  user: string;
  userAvatar: string;
  type: 'text' | 'image' | 'video';
  content: string; // text or url
  description?: string;
  likes: number;
  dislikes: number;
  comments: Comment[];
  timestamp: Date;
}
