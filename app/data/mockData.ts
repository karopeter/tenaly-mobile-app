import { Conversation, Message } from "../types/message";

export const conversations: Conversation[] = [
  {
    id: 1,
    user: {
      id: 1,
      name: 'Blessing Joe',
      avatar: '👨‍💼',
      online: true,
    },
    lastMessage: 'Hello, good morning, is this...',
    time: 'Today, 08:00am',
    unread: 1,
  },
  {
    id: 2,
    user: {
      id: 2,
      name: 'Kalu Mark',
      avatar: '👨‍🦱',
      online: false,
    },
    lastMessage: 'Is this car still available?',
    time: 'Today, 08:00am',
    unread: 0,
  },
  {
    id: 3,
    user: {
      id: 3,
      name: 'Kalu Mark',
      avatar: '👨‍🦱',
      online: false,
    },
    lastMessage: 'Is this car still available?',
    time: 'Today, 08:00am',
    unread: 0,
  },
  {
    id: 4,
    user: {
      id: 4,
      name: 'Kalu Mark',
      avatar: '👨‍🦱',
      online: false,
    },
    lastMessage: 'Hello, good morning, is this...',
    time: 'Today, 08:00am',
    unread: 1,
  },
];

export const chatMessages: Message[] = [
  {
    id: 1,
    text: 'Good afternoon, Please I want to ask if this is still available',
    sender: 'other',
    time: '09:25am',
    date: 'Sep 10, 2024',
  },
  {
    id: 2,
    text: 'Good Afternoon',
    sender: 'me',
    time: '09:26am',
  },
  {
    id: 3,
    text: 'No, its not. So sorry for the inconvenience. I forgot to mark it as sold',
    sender: 'me',
    time: '09:26am',
  },
];