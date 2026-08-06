import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { StorageService } from './storage.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { GetPresignedUrlDto } from './dto/storage.dto';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('presign')
  @UseGuards(AuthGuard)
  async getPresignedUrl(@Body() data: GetPresignedUrlDto) {
    return this.storageService.getPresignedUrl(data.fileName, data.contentType);
  }
}
