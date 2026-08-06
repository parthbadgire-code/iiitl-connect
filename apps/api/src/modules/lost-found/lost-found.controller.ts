import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { LostFoundService } from './lost-found.service';
import { CreateLostFoundDto } from './dto/create-lost-found.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { ItemType } from '@prisma/client';

@Controller('lost-found')
@UseGuards(AuthGuard)
export class LostFoundController {
  constructor(private readonly lostFoundService: LostFoundService) {}

  @Get()
  async getItems(@Query('type') type?: ItemType) {
    return this.lostFoundService.getItems(type);
  }

  @Post()
  async createItem(
    @Body() dto: CreateLostFoundDto,
    @CurrentUser() user: any,
  ) {
    return this.lostFoundService.createItem(dto, user.id);
  }

  @Patch(':id/resolve')
  async markResolved(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.lostFoundService.markResolved(id, user.id);
  }
}
