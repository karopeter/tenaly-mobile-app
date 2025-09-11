import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message } from '../types/message';

class SocketService {
    private socket: any = null;
    private isConnecting = false;

    async connect() {
        if (this.socket?.connected || this.isConnecting) return this.socket;

        this.isConnecting = true;

        try {
        const token = await AsyncStorage.getItem('auth_token');
        const baseUrl = 'https://api.tenaly.com';

        if (!token) {
            throw new Error('No authentication token found');
        }

        this.socket = io(baseUrl, {
          auth: { token },
          transports: ['websocket'],
          forceNew: false,
          reconnection: true,
          timeout: 20000,
        });

        return new Promise((resolve, reject) => {
            this.socket.on('connect', () => {
              console.log('Socket connected:', this.socket.id);
              this.isConnecting = false;
              resolve(this.socket);
            });

            this.socket.on('connect_error', (error: any) => {
              console.error('Socket connection error:', error);
              this.isConnecting = false;
              reject(error);
            });

            this.socket.on('disconnect', (reason: string) => {
                console.log('Socket disconnected:', reason);
                this.isConnecting = false;
            });
        });
        } catch (error) {
          this.isConnecting = false;
          throw error;
        }
    }

    disconnect() {
        if (this.socket) {
         this.socket.disconnect();
         this.socket = null;
        }
    }

    joinRoom(conversationId: string) {
      if (this.socket?.connected) {
        this.socket.emit('joinRoom', conversationId);
      }
    }

    sendMessage(messageData: any) {
        if (this.socket?.connected) {
          this.socket.emit('sendMessage', messageData);
        }
    }

    markAsRead(messageIds: string[], conversationId: string) {
        if (this.socket?.connected) {
            this.socket.emit('markAsRead', { messageIds, conversationId });
        }
    }

    onReceiveMessage(callback: (message: Message) => void) {
      if (this.socket) {
        this.socket.on('receiveMessage', callback);
      }
    }

    onHistoricalMessages(callback: (messages: Message[]) => void) {
        if (this.socket) {
            this.socket.on('historicalMessages', callback);
        }
    }

    onNewMessageNotification(callback: (notification: any) => void) {
     if (this.socket) {
        this.socket.on('newMessageNotification', callback);
     }
    }

    offReceiveMessage() {
         if (this.socket) {
            this.socket.off('receiveMessage');
         }
    }

    offHistoricalMessages() {
      if (this.socket) {
        this.socket.off('historicalMessages');
      }
    }

    startTyping(conversationId: string) {
        if (this.socket?.connected) {
            this.socket.emit('typing', { conversationId });
        }
    }

    stopTyping(conversationId: string) {
        if (this.socket?.connected) {
         this.socket.emit('stopTyping', { conversationId });
        }
    }

    onTyping(callback: (data: any) => void) {
        if (this.socket) {
            this.socket.on('typing', callback);
        }
    }

    onStopTyping(callback: (data: any) => void) {
        if (this.socket) {
            this.socket.on('stopTyping', callback);
        }
    }
}

export default new SocketService();