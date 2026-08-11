import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

export type NotificationType = 'INFO' | 'MATCH' | 'MESSAGE' | 'EVENT' | 'MARKETPLACE' | 'ACADEMIC' | 'CLUB' | 'SYSTEM';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  socket: Socket | null;
  connect: (userId: string) => void;
  disconnect: () => void;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: AppNotification) => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const SOCKET_URL = API_URL.replace('/api', '');

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  socket: null,

  connect: (userId: string) => {
    const existingSocket = get().socket;
    if (existingSocket) return;

    const socket = io(`${SOCKET_URL}/notifications`, {
      auth: { userId },
    });

    socket.on('connect', () => {
      console.log('Connected to notifications socket');
    });

    socket.on('newNotification', (notification: AppNotification) => {
      get().addNotification(notification);
      // Optional: Trigger a browser toast here if a global toast provider is available
    });

    set({ socket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },

  fetchNotifications: async () => {
    try {
      const res = await fetch(`${API_URL}/notifications`, { credentials: 'include' });
      if (res.ok) {
        const notifications: AppNotification[] = await res.json();
        const unreadCount = notifications.filter(n => !n.isRead).length;
        set({ notifications, unreadCount });
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  },

  addNotification: (notification: AppNotification) => {
    set((state) => {
      // Check if it already exists to prevent duplicates
      if (state.notifications.some(n => n.id === notification.id)) return state;
      const notifications = [notification, ...state.notifications];
      const unreadCount = notifications.filter(n => !n.isRead).length;
      return { notifications, unreadCount };
    });
  },

  markAsRead: async (id: string) => {
    try {
      set((state) => {
        const notifications = state.notifications.map(n => 
          n.id === id ? { ...n, isRead: true } : n
        );
        const unreadCount = notifications.filter(n => !n.isRead).length;
        return { notifications, unreadCount };
      });
      
      // Hit backend only if it's not a temporary global notification id
      if (!id.startsWith('global_')) {
        await fetch(`${API_URL}/notifications/${id}/read`, {
          method: 'PATCH',
          credentials: 'include'
        });
      }
    } catch (err) {
      console.error(err);
    }
  },

  markAllAsRead: async () => {
    try {
      set((state) => {
        const notifications = state.notifications.map(n => ({ ...n, isRead: true }));
        return { notifications, unreadCount: 0 };
      });

      await fetch(`${API_URL}/notifications/read-all`, {
        method: 'PATCH',
        credentials: 'include'
      });
    } catch (err) {
      console.error(err);
    }
  },
}));
