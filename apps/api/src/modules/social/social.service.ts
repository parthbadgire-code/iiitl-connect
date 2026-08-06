import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreatePostDto } from './dto/create-post.dto';
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

  async getFeed(category?: PostCategory, userId?: string) {
    const where = category ? { category } : {};

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

    return this.database.postReply.create({
      data: { postId, content, anonymousIdentityId: identity.id },
      include: {
        anonymousIdentity: { select: { avatarSeed: true } },
      },
    });
  }

  async getReplies(postId: string) {
    return this.database.postReply.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
      include: {
        anonymousIdentity: { select: { avatarSeed: true } },
      },
    });
  }
}
