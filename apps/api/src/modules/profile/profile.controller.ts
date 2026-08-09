import { Controller, Get, Put, Delete, Body, UseGuards, Query, Param, NotFoundException } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpsertProfileDto } from './dto/profile.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';

@Controller('profile')
@UseGuards(AuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  async getMyProfile(@CurrentUser() user: any) {
    return this.profileService.getMyProfile(user.id);
  }

  @Put('me')
  async updateMyProfile(
    @CurrentUser() user: any,
    @Body() data: UpsertProfileDto,
  ) {
    return this.profileService.upsertProfile(user.id, data);
  }

  @Put('avatar')
  async updateAvatar(
    @CurrentUser() user: any,
    @Body('imageUrl') imageUrl: string,
  ) {
    return this.profileService.updateAvatar(user.id, imageUrl);
  }

  @Get('search')
  async searchProfiles(@Query('q') query: string) {
    if (!query || query.trim().length === 0) {
      return [];
    }
    return this.profileService.searchProfiles(query.trim());
  }

  @Get('public/:id')
  async getPublicProfile(@Param('id') id: string) {
    const profile = await this.profileService.getPublicProfile(id);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }

  @Delete('admin/:id')
  async deleteUser(
    @Param('id') id: string,
    @CurrentUser() admin: any,
  ) {
    return this.profileService.adminDeleteUser(id, admin.id);
  }
}
