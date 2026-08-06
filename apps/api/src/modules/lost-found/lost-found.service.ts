import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateLostFoundDto } from './dto/create-lost-found.dto';
import { ItemType } from '@prisma/client';

@Injectable()
export class LostFoundService {
  constructor(private readonly database: DatabaseService) {}

  async getItems(type?: ItemType) {
    return this.database.lostAndFoundItem.findMany({
      where: {
        ...(type ? { type } : {}),
        isResolved: false,
      },
      include: {
        reporter: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createItem(data: CreateLostFoundDto, userId: string) {
    return this.database.lostAndFoundItem.create({
      data: {
        reporterId: userId,
        type: data.type,
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
      },
      include: {
        reporter: {
          select: { id: true, name: true, image: true },
        },
      },
    });
  }

  async markResolved(id: string, userId: string) {
    // Only the reporter can mark as resolved
    const item = await this.database.lostAndFoundItem.findFirst({
      where: { id, reporterId: userId },
    });
    if (!item) return null;

    return this.database.lostAndFoundItem.update({
      where: { id },
      data: { isResolved: true },
    });
  }
}
