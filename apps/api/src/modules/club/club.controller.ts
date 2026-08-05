import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ClubService } from './club.service';
import { CreateClubDto, AddMemberDto, TransferRoleDto } from './dto/club.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';

@Controller('clubs')
@UseGuards(AuthGuard)
export class ClubController {
  constructor(private readonly clubService: ClubService) {}

  @Get()
  async getAllClubs() {
    return this.clubService.getAllClubs();
  }

  @Post()
  async createClub(@Body() data: CreateClubDto, @CurrentUser() user: any) {
    return this.clubService.createClub(data, user.id);
  }

  @Get(':id')
  async getClubDetails(@Param('id') clubId: string) {
    return this.clubService.getClubDetails(clubId);
  }

  @Post(':id/members')
  async addMemberToClub(
    @Param('id') clubId: string,
    @Body() data: AddMemberDto,
    @CurrentUser() user: any,
  ) {
    return this.clubService.addMemberToClub(clubId, data, user.id);
  }

  @Post(':id/transfer-role')
  async transferRole(
    @Param('id') clubId: string,
    @Body() data: TransferRoleDto,
    @CurrentUser() user: any,
  ) {
    return this.clubService.transferRole(clubId, data, user.id);
  }
}
