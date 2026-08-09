import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ConnectionsService } from './connections.service';
import { CreateProfileDto, SwipeDto, SendMessageDto } from './dto/connections.dto';
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

  @Put('profile')
  async updateProfile(
    @Body() data: CreateProfileDto,
    @CurrentUser() user: any,
  ) {
    return this.connectionsService.createProfile(data, user.id); // Upsert handles both
  }

  @Delete('profile')
  async deleteProfile(@CurrentUser() user: any) {
    return this.connectionsService.deleteProfile(user.id);
  }

  @Delete('admin/profiles/:id')
  async adminDeleteProfile(
    @Param('id') profileId: string,
    @CurrentUser() user: any,
  ) {
    return this.connectionsService.adminDeleteProfile(profileId, user.id);
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

  @Get('matches/:matchId/messages')
  async getMessages(
    @Param('matchId') matchId: string,
    @CurrentUser() user: any,
  ) {
    return this.connectionsService.getMessages(matchId, user.id);
  }

  @Post('matches/:matchId/messages')
  async sendMessage(
    @Param('matchId') matchId: string,
    @Body() data: SendMessageDto,
    @CurrentUser() user: any,
  ) {
    return this.connectionsService.sendMessage(matchId, data, user.id);
  }
}
