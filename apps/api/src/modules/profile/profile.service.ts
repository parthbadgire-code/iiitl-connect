import { Injectable, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { UpsertProfileDto } from './dto/profile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly database: DatabaseService) {}

  async getMyProfile(userId: string) {
    return this.database.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        studentProfile: true,
        clubMemberships: {
          include: {
            club: true,
          }
        },
      }
    });
  }

  async upsertProfile(userId: string, data: UpsertProfileDto) {
    return this.database.studentProfile.upsert({
      where: { userId },
      update: {
        bio: data.bio,
        batch: data.batch,
        linkedinUrl: data.linkedinUrl,
        instagramUrl: data.instagramUrl,
        githubUrl: data.githubUrl,
        interests: data.interests || [],
      },
      create: {
        userId,
        bio: data.bio,
        batch: data.batch,
        linkedinUrl: data.linkedinUrl,
        instagramUrl: data.instagramUrl,
        githubUrl: data.githubUrl,
        interests: data.interests || [],
      },
    });
  }

  async updateAvatar(userId: string, imageUrl: string) {
    return this.database.user.update({
      where: { id: userId },
      data: { image: imageUrl },
    });
  }

  async searchProfiles(query: string) {
    return this.database.user.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        name: true,
        image: true,
        role: true,
        studentProfile: {
          select: {
            batch: true,
          }
        }
      },
      take: 10,
    });
  }

  async getPublicProfile(userId: string) {
    return this.database.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        studentProfile: true,
        clubMemberships: {
          include: {
            club: true,
          }
        },
      }
    });
  }

  async adminDeleteUser(userIdToDelete: string, adminId: string) {
    const admin = await this.database.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Unauthorized. Admin access required.');
    }

    return this.database.user.delete({
      where: { id: userIdToDelete },
    });
  }
}
