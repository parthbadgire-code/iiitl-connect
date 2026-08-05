import { Injectable, ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateClubDto, AddMemberDto } from './dto/club.dto';
import { ClubRole } from '@prisma/client';

@Injectable()
export class ClubService {
  constructor(private readonly database: DatabaseService) {}

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
      include: {
        _count: {
          select: { members: true, events: true }
        }
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
}
