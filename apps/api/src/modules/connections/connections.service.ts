import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateProfileDto, SwipeDto, SendMessageDto } from './dto/connections.dto';
import { isProfane } from '../../common/utils/profanity.util';
import { NotificationsService, NotificationType } from '../notifications/notifications.service';

@Injectable()
export class ConnectionsService {
  constructor(
    private readonly database: DatabaseService,
    private readonly notifications: NotificationsService
  ) {}

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
        year: data.year,
        bio: data.bio,
        prompts: data.prompts || [],
        interests: data.interests,
        lookingFor: data.lookingFor,
      },
      create: {
        userId,
        username: data.username,
        gender: data.gender,
        year: data.year,
        bio: data.bio,
        prompts: data.prompts || [],
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

  async getDiscoverFeed(userId: string, filters: any = {}) {
    // Fetch profiles of users that:
    // 1. Are not the current user
    // 2. The current user has NOT already swiped on
    // 3. Are not blocked
    
    const swiped = await this.database.swipe.findMany({
      where: { senderId: userId },
      select: { receiverId: true },
    });
    const swipedIds = swiped.map((s) => s.receiverId);
    swipedIds.push(userId); // also exclude self

    const blocksGiven = await this.database.connectionBlock.findMany({ where: { blockerId: userId } });
    const blocksReceived = await this.database.connectionBlock.findMany({ where: { blockedId: userId } });
    const blockedIds = [
      ...blocksGiven.map(b => b.blockedId),
      ...blocksReceived.map(b => b.blockerId)
    ];

    const excludeIds = [...new Set([...swipedIds, ...blockedIds])];

    const whereClause: any = {
      userId: { notIn: excludeIds },
    };
    if (filters.year) whereClause.year = filters.year;
    if (filters.gender) whereClause.gender = filters.gender;
    if (filters.lookingFor) whereClause.lookingFor = { has: filters.lookingFor };

    const myProfile = await this.database.connectionProfile.findUnique({ where: { userId } });

    const profiles = await this.database.connectionProfile.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            // Hiding name and image for privacy!
          }
        }
      },
      take: 20, // return a batch
    });

    if (!myProfile) return profiles;

    // Match scoring
    const scored = profiles.map(p => {
      let score = 15; // Base score
      
      const myInterests = myProfile.interests.map(i => i.toLowerCase());
      const commonInterests = p.interests.filter(i => myInterests.includes(i.toLowerCase())).length;
      score += commonInterests * 15;
      
      const commonGoals = p.lookingFor.filter(g => myProfile.lookingFor.includes(g)).length;
      score += commonGoals * 20;

      return {
        ...p,
        matchScore: Math.min(score, 99)
      };
    });

    return scored.sort((a, b) => b.matchScore - a.matchScore);
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
        
        // Notify both users of the match
        await this.notifications.createNotification({
          userId: user1Id,
          title: 'New Match!',
          message: 'You have a new mutual connection. Start chatting!',
          type: NotificationType.MATCH,
          link: '/connections',
        });
        await this.notifications.createNotification({
          userId: user2Id,
          title: 'New Match!',
          message: 'You have a new mutual connection. Start chatting!',
          type: NotificationType.MATCH,
          link: '/connections',
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
            connectionProfile: true,
          }
        },
        user2: {
          select: {
            id: true,
            name: true,
            email: true,
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

    if (isProfane(data.content)) {
      throw new BadRequestException("Message contains inappropriate content.");
    }

    const message = await this.database.connectionMessage.create({
      data: {
        matchId,
        senderId: userId,
        content: data.content,
      }
    });

    const receiverId = match.user1Id === userId ? match.user2Id : match.user1Id;
    
    // Notify receiver
    const sender = await this.database.user.findUnique({ where: { id: userId }});
    await this.notifications.createNotification({
      userId: receiverId,
      title: 'New Message',
      message: `${sender?.name || 'Someone'} sent you a message.`,
      type: NotificationType.MESSAGE,
      link: '/connections',
    });

    return message;
  }

  async blockUser(userIdToBlock: string, currentUserId: string) {
    if (userIdToBlock === currentUserId) throw new ConflictException("Cannot block yourself");
    
    await this.database.connectionBlock.upsert({
      where: { blockerId_blockedId: { blockerId: currentUserId, blockedId: userIdToBlock } },
      create: { blockerId: currentUserId, blockedId: userIdToBlock },
      update: {}
    });

    await this.database.swipe.deleteMany({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: userIdToBlock },
          { senderId: userIdToBlock, receiverId: currentUserId }
        ]
      }
    });
    
    await this.database.mutualConnection.deleteMany({
      where: {
        OR: [
          { user1Id: currentUserId, user2Id: userIdToBlock },
          { user1Id: userIdToBlock, user2Id: currentUserId }
        ]
      }
    });
    return { success: true };
  }

  async reportUser(userIdToReport: string, reason: string, currentUserId: string) {
    if (userIdToReport === currentUserId) throw new ConflictException("Cannot report yourself");
    await this.database.connectionReport.create({
      data: {
        reporterId: currentUserId,
        reportedUserId: userIdToReport,
        reason
      }
    });
    // Auto-block the reported user
    await this.blockUser(userIdToReport, currentUserId);
    return { success: true };
  }
}
