import { Controller, Get, Post, Delete, Body, Query, Param, UseGuards } from '@nestjs/common';
import { SocialService } from './social.service';
import { CreatePostDto } from './dto/create-post.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { PostCategory, ReactionType } from '@prisma/client';

@Controller('social')
@UseGuards(AuthGuard)
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Get('feed')
  async getFeed(
    @Query('category') category?: PostCategory,
    @Query('month') month?: string,
    @Query('year') year?: string,
    @CurrentUser() user?: any,
  ) {
    return this.socialService.getFeed(category, month, year, user?.id);
  }

  @Post('feed')
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @CurrentUser() user: any,
  ) {
    return this.socialService.createPost(createPostDto, user.id);
  }

  @Post('feed/:postId/react')
  async reactToPost(
    @Param('postId') postId: string,
    @Body('type') type: ReactionType,
    @CurrentUser() user: any,
  ) {
    return this.socialService.reactToPost(postId, type, user.id);
  }

  @Post('feed/:postId/reply')
  async replyToPost(
    @Param('postId') postId: string,
    @Body('content') content: string,
    @CurrentUser() user: any,
  ) {
    return this.socialService.replyToPost(postId, content, user.id);
  }

  @Get('feed/:postId/replies')
  async getReplies(@Param('postId') postId: string) {
    return this.socialService.getReplies(postId);
  }

  @Delete('feed/:postId')
  async deletePost(
    @Param('postId') postId: string,
    @CurrentUser() user: any,
  ) {
    return this.socialService.deletePost(postId, user.id);
  }
}
