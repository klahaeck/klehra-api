import { Controller, Get } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CalendarEvent } from '../ical/ical.service';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get('events')
  async getCalendarEvents(): Promise<CalendarEvent[]> {
    return await this.calendarService.getCalendarEvents();
  }
}
