export interface User {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: 'customer' | 'seller' | 'admin';
  image?: string;
  isVerified: boolean;
  createdAt: boolean;
}


export interface Conversation {
  _id: string;
  sellerId: string;
  customerId: string;   
  lastMessageAt?: string;
  adId?: string;
  adTitle?: string;
  createdAt?:  string;
  updatedAt?: string;
  otherUser?: User;
}

export interface Message {
   _id: string;
   conversationId: string;
   from: string | User;
   to: string | User;
   text?: string;
   file?: {
    filename: string;
    path: string;
    mimetype: string;
    size: number;
   };
   time: string;
   readBy: string[];
   createdAt: string;
   adTitle?: string;
}

export interface FileAttachment {
    type: 'image' | 'file';
    uri: string;
    name?: string;
    size?: number;
    mimeType?: string;
}

export type ScreenType = 'empty' | 'list' | 'chat';