import { Injectable } from '@nestjs/common';
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
}
