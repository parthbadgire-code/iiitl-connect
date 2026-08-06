import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';
import { CreateListingDto } from './dto/marketplace.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';

@Controller('marketplace')
@UseGuards(AuthGuard)
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Get()
  async getAllListings() {
    return this.marketplaceService.getAllListings();
  }

  @Post()
  async createListing(
    @CurrentUser() user: any,
    @Body() data: CreateListingDto,
  ) {
    return this.marketplaceService.createListing(user.id, data);
  }

  @Get(':id')
  async getListingById(@Param('id') id: string) {
    return this.marketplaceService.getListingById(id);
  }
}
