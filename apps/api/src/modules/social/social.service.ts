import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreatePostDto } from './dto/create-post.dto';
import { isProfane } from '../../common/utils/profanity.util';
import { PostCategory, ReactionType } from '@prisma/client';

const ADJECTIVES = ['Silent', 'Neon', 'Cyber', 'Quantum', 'Shadow', 'Cosmic', 'Phantom', 'Glitch', 'Midnight', 'Electric', 'Rogue', 'Mystic', 'Hyper', 'Stellar'];
const NOUNS = ['Ninja', 'Hacker', 'Fox', 'Wolf', 'Raven', 'Ghost', 'Dragon', 'Phoenix', 'Byte', 'Pixel', 'Nomad', 'Cipher'];

@Injectable()
export class SocialService {
  constructor(private readonly database: DatabaseService) {}

  private generateRandomMoniker(): string {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const id = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${adj} ${noun} #${id}`;
  }

  async getOrCreateAnonymousIdentity(userId: string) {
    let identity = await this.database.anonymousIdentity.findUnique({
      where: { userId },
    });

    if (!identity) {
      identity = await this.database.anonymousIdentity.create({
        data: {
          userId,
          avatarSeed: this.generateRandomMoniker(),
        },
      });
    }

    return identity;
  }

  async createPost(data: CreatePostDto, userId: string) {
    const identity = await this.getOrCreateAnonymousIdentity(userId);

    if (identity.isBanned) {
      throw new Error('Your anonymous identity has been banned.');
    }

    if (isProfane(data.content)) {
      throw new BadRequestException("Content contains inappropriate words.");
    }

    return this.database.anonymousPost.create({
      data: {
        content: data.content,
        category: data.category,
        anonymousIdentityId: identity.id,
      },
      include: {
        anonymousIdentity: {
          select: { avatarSeed: true }
        },
        _count: { select: { reactions: true, replies: true } },
        reactions: { select: { type: true, anonymousIdentityId: true } },
      }
    });
  }

  async getFeed(category?: PostCategory, month?: string, year?: string, userId?: string) {
    const where: any = {};
    if (category) where.category = category;
    
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 1);
      where.createdAt = {
        gte: startDate,
        lt: endDate,
      };
    }

    const identity = userId ? await this.database.anonymousIdentity.findUnique({ where: { userId } }) : null;

    const posts = await this.database.anonymousPost.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        anonymousIdentity: {
          select: {
            id: true,
            avatarSeed: true,
            // DO NOT select userId here
          },
        },
        _count: {
          select: { reactions: true, replies: true },
        },
        reactions: {
          select: { type: true, anonymousIdentityId: true },
        },
      },
    });

    // For each post, compute like/dislike counts and whether the current user reacted
    return posts.map(post => {
      const likes = post.reactions.filter(r => r.type === 'LIKE').length;
      const dislikes = post.reactions.filter(r => r.type === 'DISLIKE').length;
      const myReaction = identity
        ? (post.reactions.find(r => r.anonymousIdentityId === identity.id)?.type ?? null)
        : null;

      return {
        id: post.id,
        content: post.content,
        category: post.category,
        createdAt: post.createdAt,
        anonymousIdentity: post.anonymousIdentity,
        likes,
        dislikes,
        replyCount: post._count.replies,
        myReaction,
        isMine: identity ? post.anonymousIdentityId === identity.id : false,
      };
    });
  }

  async reactToPost(postId: string, type: ReactionType, userId: string) {
    const identity = await this.getOrCreateAnonymousIdentity(userId);

    // Check if user already reacted
    const existing = await this.database.postReaction.findUnique({
      where: { postId_anonymousIdentityId: { postId, anonymousIdentityId: identity.id } },
    });

    if (existing) {
      if (existing.type === type) {
        // Toggle off — same reaction, so remove it
        await this.database.postReaction.delete({
          where: { postId_anonymousIdentityId: { postId, anonymousIdentityId: identity.id } },
        });
        return { reaction: null };
      } else {
        // Switch reaction type
        const updated = await this.database.postReaction.update({
          where: { postId_anonymousIdentityId: { postId, anonymousIdentityId: identity.id } },
          data: { type },
        });
        return { reaction: updated.type };
      }
    }

    // Create new reaction
    const created = await this.database.postReaction.create({
      data: { postId, anonymousIdentityId: identity.id, type },
    });
    return { reaction: created.type };
  }

  async replyToPost(postId: string, content: string, userId: string) {
    const identity = await this.getOrCreateAnonymousIdentity(userId);

    if (identity.isBanned) {
      throw new Error('Your anonymous identity has been banned.');
    }

    if (isProfane(content)) {
      throw new BadRequestException("Content contains inappropriate words.");
    }

    return this.database.postReply.create({
      data: { postId, content, anonymousIdentityId: identity.id },
      include: {
        anonymousIdentity: { select: { avatarSeed: true } },
      },
    });
  }

  async getReplies(postId: string, userId?: string) {
    const identity = userId ? await this.database.anonymousIdentity.findUnique({ where: { userId } }) : null;
    const replies = await this.database.postReply.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
      include: {
        anonymousIdentity: { select: { avatarSeed: true } },
      },
    });

    return replies.map(r => ({
      ...r,
      isMine: identity ? r.anonymousIdentityId === identity.id : false,
    }));
  }

  async deletePost(postId: string, userId: string) {
    const user = await this.database.user.findUnique({ where: { id: userId } });
    const identity = await this.database.anonymousIdentity.findUnique({ where: { userId } });
    const post = await this.database.anonymousPost.findUnique({ where: { id: postId } });
    if (!post) throw new Error('Post not found');

    if (user?.role !== 'SUPER_ADMIN' && post.anonymousIdentityId !== identity?.id) {
      throw new Error('Unauthorized. Admin or post owner access required.');
    }

    return this.database.anonymousPost.delete({
      where: { id: postId }
    });
  }

  async deleteReply(replyId: string, userId: string) {
    const user = await this.database.user.findUnique({ where: { id: userId } });
    const identity = await this.database.anonymousIdentity.findUnique({ where: { userId } });
    const reply = await this.database.postReply.findUnique({ where: { id: replyId } });
    if (!reply) throw new Error('Reply not found');

    if (user?.role !== 'SUPER_ADMIN' && reply.anonymousIdentityId !== identity?.id) {
      throw new Error('Unauthorized. Admin or reply owner access required.');
    }

    return this.database.postReply.delete({
      where: { id: replyId }
    });
  }
}
