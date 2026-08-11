import { Injectable, ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateClubDto, AddMemberDto, CreateClubResourceDto } from './dto/club.dto';
import { ClubRole } from '@prisma/client';
import { NotificationsService, NotificationType } from '../notifications/notifications.service';

@Injectable()
export class ClubService {
  constructor(
    private readonly database: DatabaseService,
    private readonly notifications: NotificationsService
  ) {}

  async createClub(data: CreateClubDto, userId: string) {
    // Ensure slug is unique
    const existing = await this.database.club.findUnique({ where: { slug: data.slug } });
    if (existing) throw new ConflictException("Club with this slug already exists.");

    const club = await this.database.club.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
      }
    });

    // Automatically make the creator a LEAD
    await this.database.clubMember.create({
      data: {
        userId,
        clubId: club.id,
        role: ClubRole.LEAD,
      }
    });

    return club;
  }

  async getAllClubs() {
    return this.database.club.findMany({
      where: {
        NOT: {
          slug: { startsWith: 'axios-' }
        }
      },
      include: {
        _count: {
          select: { members: true, events: true }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  async getAxiosWings() {
    return this.database.club.findMany({
      where: { slug: { startsWith: 'axios-' } },
      include: {
        _count: { select: { members: true, events: true } }
      },
      orderBy: { name: 'asc' }
    });
  }

  async getClubDetails(clubId: string) {
    const club = await this.database.club.findUnique({
      where: { id: clubId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              }
            }
          },
          orderBy: [
            { role: 'asc' }, // LEAD first, then CORE, then MEMBER
          ]
        },
        events: {
          orderBy: { date: 'asc' }
        },
        resources: {
          include: {
            uploader: {
              select: { name: true, image: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!club) throw new NotFoundException("Club not found");
    return club;
  }

  async addMemberToClub(clubId: string, data: AddMemberDto, userId: string) {
    // 1. Verify executing user is a LEAD of this club
    const executorMembership = await this.database.clubMember.findUnique({
      where: {
        userId_clubId: {
          userId,
          clubId,
        }
      }
    });

    if (!executorMembership || executorMembership.role !== ClubRole.LEAD) {
      throw new ForbiddenException("You must be a LEAD of this club to manage the roster.");
    }

    // 2. Lookup target student
    const targetUser = await this.database.user.findUnique({
      where: { email: data.email }
    });

    if (!targetUser) {
      throw new NotFoundException(`User with email ${data.email} not found.`);
    }

    // 3. Upsert the membership
    return this.database.clubMember.upsert({
      where: {
        userId_clubId: {
          userId: targetUser.id,
          clubId,
        }
      },
      update: {
        role: data.role,
      },
      create: {
        userId: targetUser.id,
        clubId,
        role: data.role,
      }
    });
  }

  async transferRole(clubId: string, data: { email: string }, userId: string) {
    // 1. Verify executor has a membership
    const executorMembership = await this.database.clubMember.findUnique({
      where: { userId_clubId: { userId, clubId } }
    });

    if (!executorMembership || executorMembership.role === ClubRole.MEMBER || executorMembership.role === ClubRole.VOLUNTEER) {
      throw new ForbiddenException("You do not hold a transferable role in this club.");
    }

    // 2. Lookup target student
    const targetUser = await this.database.user.findUnique({
      where: { email: data.email }
    });

    if (!targetUser) {
      throw new NotFoundException(`User with email ${data.email} not found.`);
    }

    if (targetUser.id === userId) {
      throw new ConflictException("You cannot transfer a role to yourself.");
    }

    // 3. Execute transfer transaction
    return this.database.$transaction([
      // Upsert target user with executor's role
      this.database.clubMember.upsert({
        where: { userId_clubId: { userId: targetUser.id, clubId } },
        update: { role: executorMembership.role },
        create: { userId: targetUser.id, clubId, role: executorMembership.role }
      }),
      // Downgrade executor to SENIOR_MEMBER
      this.database.clubMember.update({
        where: { userId_clubId: { userId, clubId } },
        data: { role: ClubRole.SENIOR_MEMBER }
      })
    ]);
  }

  async addResourceToClub(clubId: string, data: CreateClubResourceDto, userId: string) {
    // 1. Verify executing user is LEAD or COORDINATOR
    const executorMembership = await this.database.clubMember.findUnique({
      where: { userId_clubId: { userId, clubId } }
    });

    if (!executorMembership || (executorMembership.role !== ClubRole.LEAD && executorMembership.role !== ClubRole.COORDINATOR && executorMembership.role !== ClubRole.CORE)) {
      throw new ForbiddenException("You must be a LEAD, CORE, or COORDINATOR of this club to add resources.");
    }

    const resource = await this.database.clubResource.create({
      data: {
        title: data.title,
        description: data.description,
        url: data.url,
        type: data.type,
        clubId,
        uploaderId: userId,
      }
    });

    const club = await this.database.club.findUnique({ where: { id: clubId } });

    this.notifications.createGlobalNotification({
      title: `New Resource in ${club?.name || 'a Club'}`,
      message: `A new ${data.type} resource "${data.title}" was just added!`,
      type: NotificationType.CLUB,
      link: club?.slug.startsWith('axios-') ? `/axios/${club.slug}` : `/clubs/${club?.id}`,
    }).catch(console.error);

    return resource;
  }
}
