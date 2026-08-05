import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
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
  async upsertProfile(
    @Body() data: UpsertProfileDto,
    @CurrentUser() user: any,
  ) {
    return this.profileService.upsertProfile(user.id, data);
  }
}
