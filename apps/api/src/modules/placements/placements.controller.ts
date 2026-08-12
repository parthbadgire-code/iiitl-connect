import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { PlacementsService } from './placements.service';
import { CreateOffCampusDto, CreateOAQuestionDto, CreateResumeRequestDto, UpdateResumeRequestDto, CreateInterviewExperienceDto } from './dto/placements.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';

@Controller('placements')
@UseGuards(AuthGuard)
export class PlacementsController {
  constructor(private readonly placementsService: PlacementsService) {}

  @Get('off-campus')
  async getOffCampusOpportunities() {
    return this.placementsService.getOffCampusOpportunities();
  }

  @Post('off-campus')
  async createOffCampusOpportunity(@Body() data: CreateOffCampusDto, @CurrentUser() user: any) {
    return this.placementsService.createOffCampusOpportunity(data, user.id);
  }

  @Get('oa-questions')
  async getOAQuestions() {
    return this.placementsService.getOAQuestions();
  }

  @Post('oa-questions')
  async createOAQuestion(@Body() data: CreateOAQuestionDto, @CurrentUser() user: any) {
    return this.placementsService.createOAQuestion(data, user.id);
  }

  @Get('resume-reviews')
  async getResumeRequests() {
    return this.placementsService.getResumeRequests();
  }

  @Post('resume-reviews')
  async createResumeRequest(@Body() data: CreateResumeRequestDto, @CurrentUser() user: any) {
    return this.placementsService.createResumeRequest(data, user.id);
  }

  @Patch('resume-reviews/:id')
  async updateResumeRequest(@Param('id') id: string, @Body() data: UpdateResumeRequestDto, @CurrentUser() user: any) {
    return this.placementsService.updateResumeRequest(id, data, user.id);
  }

  @Delete('resume-reviews/:id/feedback')
  async deleteResumeFeedback(@Param('id') id: string, @CurrentUser() user: any) {
    return this.placementsService.deleteResumeFeedback(id, user.id);
  }

  @Get('interview-experiences')
  async getInterviewExperiences() {
    return this.placementsService.getInterviewExperiences();
  }

  @Post('interview-experiences')
  async createInterviewExperience(@Body() data: CreateInterviewExperienceDto, @CurrentUser() user: any) {
    return this.placementsService.createInterviewExperience(data, user.id);
  }
}
