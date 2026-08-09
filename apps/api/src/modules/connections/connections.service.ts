import { Injectable, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateProfileDto, SwipeDto, SendMessageDto } from './dto/connections.dto';

@Injectable()
export class ConnectionsService {
  constructor(private readonly database: DatabaseService) {}

  async getProfile(userId: string) {
    return this.database.connectionProfile.findUnique({
      where: { userId },
    });
  }

  async adminDeleteProfile(profileUserId: string, adminId: string) {
    const admin = await this.database.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== 'SUPER_ADMIN') {
      throw new Error('Unauthorized. Admin access required.');
    }

    return this.database.connectionProfile.delete({
      where: { userId: profileUserId },
    });
  }

  async createProfile(data: CreateProfileDto, userId: string) {
    // Check username uniqueness if they are changing it or creating new
    const existing = await this.database.connectionProfile.findUnique({
      where: { username: data.username }
    });
    
    if (existing && existing.userId !== userId) {
      throw new ConflictException("Username already taken.");
    }

    return this.database.connectionProfile.upsert({
      where: { userId },
      update: {
        username: data.username,
        gender: data.gender,
        bio: data.bio,
        interests: data.interests,
        lookingFor: data.lookingFor,
      },
      create: {
        userId,
        username: data.username,
        gender: data.gender,
        bio: data.bio,
        interests: data.interests,
        lookingFor: data.lookingFor,
      },
    });
  }

  async deleteProfile(userId: string) {
    // Also delete their mutual connections and swipes and messages
    // Handled by Prisma cascade on userId where possible, but MutualConnection has two user IDs
    await this.database.swipe.deleteMany({
      where: { OR: [{ senderId: userId }, { receiverId: userId }] }
    });
    
    await this.database.mutualConnection.deleteMany({
      where: { OR: [{ user1Id: userId }, { user2Id: userId }] }
    });

    return this.database.connectionProfile.delete({
      where: { userId },
    });
  }

  async getDiscoverFeed(userId: string) {
    // Fetch profiles of users that:
    // 1. Are not the current user
    // 2. The current user has NOT already swiped on
    
    // First get all swiped receiver IDs
    const swiped = await this.database.swipe.findMany({
      where: { senderId: userId },
      select: { receiverId: true },
    });
    const swipedIds = swiped.map((s) => s.receiverId);
    swipedIds.push(userId); // also exclude self

    return this.database.connectionProfile.findMany({
      where: {
        userId: {
          notIn: swipedIds,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            image: true,
            // Hiding name for privacy!
          }
        }
      },
      take: 20, // return a batch
    });
  }

  async submitSwipe(data: SwipeDto, userId: string) {
    if (data.receiverId === userId) {
      throw new ConflictException("You cannot swipe on yourself.");
    }

    // Upsert the swipe record
    await this.database.swipe.upsert({
      where: {
        senderId_receiverId: {
          senderId: userId,
          receiverId: data.receiverId,
        }
      },
      update: {
        action: data.action,
      },
      create: {
        senderId: userId,
        receiverId: data.receiverId,
        action: data.action,
      },
    });

    if (data.action === 'LIKE') {
      // Check if receiver has already liked the sender
      const reciprocalLike = await this.database.swipe.findFirst({
        where: {
          senderId: data.receiverId,
          receiverId: userId,
          action: 'LIKE',
        },
      });

      if (reciprocalLike) {
        // MATCH! Create a MutualConnection
        // Sort IDs to ensure consistency in the unique constraint
        const [user1Id, user2Id] = [userId, data.receiverId].sort();
        
        await this.database.mutualConnection.upsert({
          where: {
            user1Id_user2Id: {
              user1Id,
              user2Id,
            }
          },
          update: {},
          create: {
            user1Id,
            user2Id,
          }
        });
        
        return { matched: true };
      }
    }

    return { matched: false };
  }

  async getMatches(userId: string) {
    const matches = await this.database.mutualConnection.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId },
        ]
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            connectionProfile: true,
          }
        },
        user2: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            connectionProfile: true,
          }
        }
      }
    });

    // Map the results to return just the *other* person's profile
    return matches.map(match => {
      const otherUser = match.user1Id === userId ? match.user2 : match.user1;
      return {
        matchId: match.id,
        matchedAt: match.createdAt,
        user: otherUser,
      };
    });
  }

  async getMessages(matchId: string, userId: string) {
    // Verify user is part of the match
    const match = await this.database.mutualConnection.findUnique({
      where: { id: matchId }
    });

    if (!match || (match.user1Id !== userId && match.user2Id !== userId)) {
      throw new ConflictException("Invalid match access");
    }

    return this.database.connectionMessage.findMany({
      where: { matchId },
      orderBy: { createdAt: 'asc' }
    });
  }

  async sendMessage(matchId: string, data: SendMessageDto, userId: string) {
    const match = await this.database.mutualConnection.findUnique({
      where: { id: matchId }
    });

    if (!match || (match.user1Id !== userId && match.user2Id !== userId)) {
      throw new ConflictException("Invalid match access");
    }

    return this.database.connectionMessage.create({
      data: {
        matchId,
        senderId: userId,
        content: data.content,
      }
    });
  }
}
