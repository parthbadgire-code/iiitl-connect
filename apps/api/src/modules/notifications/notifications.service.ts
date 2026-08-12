import { Injectable, forwardRef, Inject, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { NotificationsGateway } from './notifications.gateway';
import * as webpush from 'web-push';

export enum NotificationType {
  INFO = 'INFO',
  MATCH = 'MATCH',
  MESSAGE = 'MESSAGE',
  EVENT = 'EVENT',
  MARKETPLACE = 'MARKETPLACE',
  ACADEMIC = 'ACADEMIC',
  CLUB = 'CLUB',
  SYSTEM = 'SYSTEM',
}

@Injectable()
export class NotificationsService implements OnModuleInit {
  constructor(
    private readonly database: DatabaseService,
    @Inject(forwardRef(() => NotificationsGateway))
    private readonly gateway: NotificationsGateway,
  ) {}

  onModuleInit() {
    if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
      webpush.setVapidDetails(
        process.env.VAPID_SUBJECT || 'mailto:admin@example.com',
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
      );
    }
  }

  async savePushSubscription(userId: string, subscription: any) {
    if (!subscription || !subscription.endpoint) return;
    return this.database.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      update: {
        userId,
        p256dh: subscription.keys?.p256dh || '',
        auth: subscription.keys?.auth || '',
      },
      create: {
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys?.p256dh || '',
        auth: subscription.keys?.auth || '',
      },
    });
  }

  async removePushSubscription(userId: string, endpoint: string) {
    return this.database.pushSubscription.deleteMany({
      where: { userId, endpoint },
    });
  }

  private async triggerWebPush(userId: string, payload: any) {
    const subscriptions = await this.database.pushSubscription.findMany({
      where: { userId },
    });
    
    for (const sub of subscriptions) {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      };
      
      try {
        await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
      } catch (err: any) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          // Subscription expired or no longer valid
          await this.database.pushSubscription.delete({ where: { id: sub.id } });
        } else {
          console.error('Error sending web push:', err);
        }
      }
    }
  }

  async getUserNotifications(userId: string) {
    return this.database.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(id: string, userId: string) {
    return this.database.notification.update({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.database.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async createNotification(data: {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    link?: string;
  }) {
    const notification = await this.database.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        link: data.link,
      },
    });

    // Emit via WebSocket
    this.gateway.emitToUser(data.userId, 'newNotification', notification);
    
    // Web Push
    this.triggerWebPush(data.userId, {
      title: data.title,
      body: data.message,
      url: data.link || '/',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
    }).catch(console.error);

    return notification;
  }

  async createGlobalNotification(data: {
    title: string;
    message: string;
    type: NotificationType;
    link?: string;
  }) {
    const users = await this.database.user.findMany({ select: { id: true } });
    if (users.length === 0) return;

    await this.database.notification.createMany({
      data: users.map(u => ({
        userId: u.id,
        title: data.title,
        message: data.message,
        type: data.type,
        link: data.link,
      }))
    });

    // We can just broadcast to everyone connected
    this.gateway.server.emit('newNotification', {
      id: 'global_' + Date.now(),
      title: data.title,
      message: data.message,
      type: data.type,
      link: data.link,
      isRead: false,
      createdAt: new Date(),
    });

    // Web Push to all stored subscriptions
    const allSubscriptions = await this.database.pushSubscription.findMany();
    const payload = JSON.stringify({
      title: data.title,
      body: data.message,
      url: data.link || '/',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
    });
    
    for (const sub of allSubscriptions) {
      try {
        await webpush.sendNotification({
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        }, payload);
      } catch (err: any) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await this.database.pushSubscription.delete({ where: { id: sub.id } });
        }
      }
    }
  }
}
