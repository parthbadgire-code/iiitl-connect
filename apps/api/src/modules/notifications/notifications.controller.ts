import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';

@Controller('notifications')
@UseGuards(AuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getMyNotifications(@CurrentUser() user: any) {
    return this.notificationsService.getUserNotifications(user.id);
  }

  @Patch('read-all')
  async markAllAsRead(@CurrentUser() user: any) {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @CurrentUser() user: any) {
    return this.notificationsService.markAsRead(id, user.id);
  }

  @Post('subscribe')
  async subscribePush(@Body() subscription: any, @CurrentUser() user: any) {
    return this.notificationsService.savePushSubscription(user.id, subscription);
  }

  @Post('unsubscribe')
  async unsubscribePush(@Body() body: { endpoint: string }, @CurrentUser() user: any) {
    return this.notificationsService.removePushSubscription(user.id, body.endpoint);
  }
}
