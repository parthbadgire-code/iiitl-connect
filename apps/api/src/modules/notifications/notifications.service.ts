import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { NotificationsGateway } from './notifications.gateway';

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
export class NotificationsService {
  constructor(
    private readonly database: DatabaseService,
    @Inject(forwardRef(() => NotificationsGateway))
    private readonly gateway: NotificationsGateway,
  ) {}

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
  }
}
