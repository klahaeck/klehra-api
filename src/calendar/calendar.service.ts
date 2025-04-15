import { Injectable } from '@nestjs/common';
import { CalendarEvent, ICalService } from '../ical/ical.service';
// import axios from 'axios';

@Injectable()
export class CalendarService {
  constructor(private readonly iCalService: ICalService) {}

  async getCalendarEvents(): Promise<CalendarEvent[]> {
    const events = await this.iCalService.getICalEvents();
    // if (events) {
    //   console.log('Fetched iCal events:', events);
    // }
    return events;
  }
}
