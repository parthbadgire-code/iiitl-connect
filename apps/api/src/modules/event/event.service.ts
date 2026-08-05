import { Injectable, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateEventDto } from './dto/event.dto';
import { ClubRole } from '@prisma/client';

@Injectable()
export class EventService {
  constructor(private readonly database: DatabaseService) {}

  async createEvent(data: CreateEventDto, clubId: string, userId: string) {
    // Verify executing user is LEAD or CORE of the club
    const membership = await this.database.clubMember.findUnique({
      where: {
        userId_clubId: {
          userId,
          clubId,
        }
      }
    });

    const allowedRoles = [ClubRole.LEAD, ClubRole.CORE, ClubRole.COORDINATOR, ClubRole.SENIOR_MEMBER] as ClubRole[];
    if (!membership || !allowedRoles.includes(membership.role)) {
      throw new ForbiddenException("Only LEAD, CORE, COORDINATOR, or SENIOR_MEMBER can create events for this club.");
    }

    return this.database.campusEvent.create({
      data: {
        title: data.title,
        date: new Date(data.date),
        venue: data.venue,
        isRSVPRequired: data.isRSVPRequired || false,
        clubId: clubId,
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
        club: {
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
}
