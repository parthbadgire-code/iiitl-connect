import { Controller, Get, Post, Body, Query, UseGuards, Delete, Patch, Param } from '@nestjs/common';
import { AcademicService } from './academic.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { ResourceType } from '@prisma/client';

@Controller('academic')
@UseGuards(AuthGuard)
export class AcademicController {
  constructor(private readonly academicService: AcademicService) {}

  @Get('resources')
  async getResources(
    @Query('courseCode') courseCode?: string,
    @Query('type') type?: ResourceType,
  ) {
    return this.academicService.getAllResources(courseCode, type);
  }

  @Post('resources')
  async createResource(
    @Body() createResourceDto: CreateResourceDto,
    @CurrentUser() user: any,
  ) {
    return this.academicService.createResource(createResourceDto, user.id);
  }

  @Patch('resources/:id')
  async updateResource(
    @Param('id') id: string,
    @Body() updateResourceDto: UpdateResourceDto,
    @CurrentUser() user: any,
  ) {
    return this.academicService.updateResource(id, updateResourceDto, user);
  }

  @Delete('resources/:id')
  async deleteResource(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.academicService.deleteResource(id, user);
  }
}
