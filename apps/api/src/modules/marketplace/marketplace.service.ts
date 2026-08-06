import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateListingDto } from './dto/marketplace.dto';

@Injectable()
export class MarketplaceService {
  constructor(private readonly database: DatabaseService) {}

  async getAllListings() {
    return this.database.marketplaceListing.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        seller: {
          select: { name: true, image: true, email: true },
        },
      },
    });
  }

  async createListing(sellerId: string, data: CreateListingDto) {
    return this.database.marketplaceListing.create({
      data: {
        sellerId,
        title: data.title,
        description: data.description,
        price: data.price,
        images: data.images || [],
      },
      include: {
        seller: {
          select: { name: true, image: true, email: true },
        },
      },
    });
  }

  async getListingById(id: string) {
    const listing = await this.database.marketplaceListing.findUnique({
      where: { id },
      include: {
        seller: {
          select: { name: true, image: true, email: true },
        },
      },
    });
    if (!listing) throw new NotFoundException('Listing not found');
    return listing;
  }
}
