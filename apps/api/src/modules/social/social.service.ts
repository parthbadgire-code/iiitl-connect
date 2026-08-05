import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreatePostDto } from './dto/create-post.dto';
import { PostCategory } from '@prisma/client';

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
          select: {
            avatarSeed: true,
          }
        }
      }
    });
  }

  async getFeed(category?: PostCategory) {
    const where = category ? { category } : {};
    
    // We strictly select only what is needed, isolating the real user
    return this.database.anonymousPost.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        anonymousIdentity: {
          select: {
            id: true,
            avatarSeed: true,
            // DO NOT select userId here
          },
        },
      },
    });
  }
}
