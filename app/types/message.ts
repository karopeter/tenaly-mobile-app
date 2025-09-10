export interface User {
    id: number;
    name: string;
    avatar: string;
    online: boolean;
}




export interface Conversation {
    id: number;
    user: User;
    lastMessage: string;
    time: string;
    unread: number;
}

export interface Message {
    id: number;
    text: string;
    sender: 'me'  | 'other';
    time: string;
    date?: string;
}

export type ScreenType = 'empty' | 'list' | 'chat';