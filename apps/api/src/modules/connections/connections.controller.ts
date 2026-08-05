import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ConnectionsService } from './connections.service';
import { CreateProfileDto, SwipeDto } from './dto/connections.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';

@Controller('connections')
@UseGuards(AuthGuard)
export class ConnectionsController {
  constructor(private readonly connectionsService: ConnectionsService) {}

  @Get('profile')
  async getProfile(@CurrentUser() user: any) {
    return this.connectionsService.getProfile(user.id);
  }

  @Post('profile')
  async createProfile(
    @Body() data: CreateProfileDto,
    @CurrentUser() user: any,
  ) {
    return this.connectionsService.createProfile(data, user.id);
  }

  @Get('discover')
  async getDiscoverFeed(@CurrentUser() user: any) {
    return this.connectionsService.getDiscoverFeed(user.id);
  }

  @Post('swipe')
  async submitSwipe(
    @Body() data: SwipeDto,
    @CurrentUser() user: any,
  ) {
    return this.connectionsService.submitSwipe(data, user.id);
  }

  @Get('matches')
  async getMatches(@CurrentUser() user: any) {
    return this.connectionsService.getMatches(user.id);
  }
}
