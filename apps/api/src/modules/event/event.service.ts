import { Injectable, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateEventDto } from './dto/event.dto';
import { ClubRole } from '@prisma/client';

@Injectable()
export class EventService {
  constructor(private readonly database: DatabaseService) {}

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

    return this.database.campusEvent.create({
      data: {
        title: data.title,
        date: new Date(data.date),
        venue: data.venue,
        imageUrl: data.imageUrl,
        isRSVPRequired: data.isRSVPRequired || false,
        clubs: {
          connect: data.clubIds.map(id => ({ id }))
        }
      }
    });
  }

  async getAllEvents() {
    return this.database.campusEvent.findMany({
      where: {
        date: {
          gte: new Date(), // upcoming events only
        }
      },
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
