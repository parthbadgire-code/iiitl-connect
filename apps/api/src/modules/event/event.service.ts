import { Injectable, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateEventDto } from './dto/event.dto';
import { ClubRole } from '@prisma/client';
import { NotificationsService, NotificationType } from '../notifications/notifications.service';

@Injectable()
export class EventService {
  constructor(
    private readonly database: DatabaseService,
    private readonly notifications: NotificationsService
  ) {}

  async createEvent(data: CreateEventDto, userId: string) {
    const user = await this.database.user.findUnique({ where: { id: userId } });
    const allowedRoles = [ClubRole.LEAD, ClubRole.CORE, ClubRole.COORDINATOR, ClubRole.SENIOR_MEMBER] as ClubRole[];
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';
    
    // Verify executing user is allowed in at least one of the clubs
    if (!isSuperAdmin) {
      const memberships = await this.database.clubMember.findMany({
        where: {
          userId,
          clubId: { in: data.clubIds }
        }
      });
      
      const hasPermission = memberships.some(m => allowedRoles.includes(m.role));
      if (!hasPermission) {
        throw new ForbiddenException("Only LEAD, CORE, COORDINATOR, or SENIOR_MEMBER of one of the participating clubs can create this event.");
      }
    }

    const event = await this.database.campusEvent.create({
      data: {
        title: data.title,
        date: new Date(data.date),
        venue: data.venue,
        imageUrl: data.imageUrl,
        externalLink: data.externalLink,
        isRSVPRequired: data.isRSVPRequired || false,
        clubs: {
          connect: data.clubIds.map(id => ({ id }))
        }
      }
    });

    // Notify all users about the new event
    this.notifications.createGlobalNotification({
      title: 'New Campus Event!',
      message: `${data.title} has been scheduled for ${new Date(data.date).toLocaleDateString()}.`,
      type: NotificationType.EVENT,
      link: `/events`,
    }).catch(console.error);

    return event;
  }

  async getAllEvents() {
    return this.database.campusEvent.findMany({
      include: {
        clubs: {
          select: {
            name: true,
            slug: true,
            logo: true,
          }
        },
        _count: {
          select: { rsvps: true }
        }
      },
      orderBy: { date: 'asc' }
    });
  }

  async getEventById(id: string) {
    return this.database.campusEvent.findUnique({
      where: { id },
      include: {
        clubs: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          }
        },
        gallery: {
          include: {
            uploader: { select: { name: true, image: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { rsvps: true }
        }
      }
    });
  }

  async uploadPhoto(eventId: string, url: string, userId: string) {
    // Determine if the user is a member of any of the host clubs
    const event = await this.database.campusEvent.findUnique({
      where: { id: eventId },
      include: { clubs: true }
    });

    if (!event) throw new ForbiddenException("Event not found");

    const clubIds = event.clubs.map(c => c.id);
    const memberships = await this.database.clubMember.findMany({
      where: {
        userId,
        clubId: { in: clubIds }
      }
    });

    const user = await this.database.user.findUnique({ where: { id: userId } });
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';

    if (!isSuperAdmin && memberships.length === 0) {
      throw new ForbiddenException("Only members of the organizing clubs can upload photos to this event.");
    }

    return this.database.eventGalleryPhoto.create({
      data: {
        eventId,
        url,
        uploaderId: userId
      }
    });
  }
}
