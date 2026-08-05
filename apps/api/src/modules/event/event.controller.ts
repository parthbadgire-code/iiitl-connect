import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/event.dto';
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

  @Post(':clubId')
  async createEvent(
    @Param('clubId') clubId: string,
    @Body() data: CreateEventDto,
    @CurrentUser() user: any,
  ) {
    return this.eventService.createEvent(data, clubId, user.id);
  }
}
