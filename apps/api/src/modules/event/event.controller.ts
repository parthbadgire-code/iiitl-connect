import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto, UploadPhotoDto } from './dto/event.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';

@Controller('events')
@UseGuards(AuthGuard)
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  async getAllEvents() {
    return this.eventService.getAllEvents();
  }

  @Post()
  async createEvent(
    @Body() data: CreateEventDto,
    @CurrentUser() user: any,
  ) {
    return this.eventService.createEvent(data, user.id);
  }

  @Get(':id')
  async getEventById(@Param('id') id: string) {
    return this.eventService.getEventById(id);
  }

  @Post(':id/photos')
  async uploadPhoto(
    @Param('id') eventId: string,
    @Body() data: UploadPhotoDto,
    @CurrentUser() user: any,
  ) {
    return this.eventService.uploadPhoto(eventId, data.url, user.id);
  }
}
