import { Injectable } from '@nestjs/common';
import { CalendarEvent, ICalService } from '../ical/ical.service';
// import axios from 'axios';

@Injectable()
export class CalendarService {
  constructor(private readonly iCalService: ICalService) {}

  async getCalendarEvents(
    startDate?: string,
    endDate?: string,
  ): Promise<CalendarEvent[]> {
    const events = await this.iCalService.getICalEvents();

    if (!startDate && !endDate) {
      return events;
    }

    return this.filterEventsByDateRange(events, startDate, endDate);
  }

  private filterEventsByDateRange(
    events: CalendarEvent[],
    startDate?: string,
    endDate?: string,
  ): CalendarEvent[] {
    return events.filter((event) => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);

      if (startDate && endDate) {
        const filterStart = new Date(startDate);
        const filterEnd = new Date(endDate);
        return eventStart >= filterStart && eventEnd <= filterEnd;
      }

      if (startDate) {
        const filterStart = new Date(startDate);
        return eventStart >= filterStart;
      }

      if (endDate) {
        const filterEnd = new Date(endDate);
        return eventEnd <= filterEnd;
      }

      return true;
    });
  }
}
