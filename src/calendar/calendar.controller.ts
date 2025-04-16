import { Controller, Get, Query } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CalendarEvent } from '../ical/ical.service';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get('events')
  getEvents(
    @Query('start') start?: string,
    @Query('end') end?: string,
  ): Promise<CalendarEvent[]> {
    return this.calendarService.getCalendarEvents(start, end);
  }
}
