import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { SocialService } from './social.service';
import { CreatePostDto } from './dto/create-post.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { PostCategory } from '@prisma/client';

@Controller('social')
@UseGuards(AuthGuard)
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Get('feed')
  async getFeed(@Query('category') category?: PostCategory) {
    return this.socialService.getFeed(category);
  }

  @Post('feed')
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @CurrentUser() user: any,
  ) {
    return this.socialService.createPost(createPostDto, user.id);
  }
}
