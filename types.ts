
export enum StreamStatus {
  IDLE = 'IDLE',
  CONNECTING = 'CONNECTING',
  LIVE = 'LIVE'
}

export interface AdConfig {
  id: string;
  placement: 'under_header' | 'before_publication' | 'under_publication' | 'footer';
  enabled: boolean;
  title: string;
  imageUrl: string;
  link: string;
}

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

export interface PrivateMessage {
  id: string;
  senderId: string;
  text?: string;
  stickerIcon?: string;
  voiceUrl?: string;
  voiceDuration?: number;
  type: 'text' | 'sticker' | 'voice';
  timestamp: Date;
}

export interface Conversation {
  id: string;
  participantName: string;
  participantAvatar: string;
  lastMessage: string;
  unreadCount: number;
  isOnline: boolean;
  messages: PrivateMessage[];
}

export interface Gift {
  id: string;
  name: string;
  icon: string;
  cost: number;
  color: string;
}

export type ViewType = 'profile' | 'feed' | 'messages' | 'discovery' | 'live' | 'admin';

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
  content: string;
  description?: string;
  likes: number;
  dislikes: number;
  comments: Comment[];
  timestamp: Date;
}

export interface AdminStats {
  totalRevenue: number;
  activeDolls: number;
  activeMentors: number;
  serverStatus: 'optimal' | 'degraded' | 'critical';
  aiLatency: number;
}
