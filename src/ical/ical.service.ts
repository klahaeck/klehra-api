/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ical from 'node-ical';
// import axios from 'axios';

export interface CalendarEvent {
  summary: string;
  description?: string;
  start: Date;
  end: Date;
  location?: string;
  uid: string;
  recurrenceRule?: string;
}

@Injectable()
export class ICalService {
  constructor(private configService: ConfigService) {}

  async getICalEvents(): Promise<CalendarEvent[]> {
    const calendarUrl = this.configService.get<string>('ICAL_CALENDAR_URL');

    if (!calendarUrl) {
      throw new Error('Missing calendar URL configuration');
    }

    try {
      const convertedUrl = this.convertWebcalToHttps(calendarUrl);
      const events = await ical.async.fromURL(convertedUrl);
      // console.log('Fetched iCal events:', events);
      return this.formatCalendarEvents(events);
    } catch (error) {
      console.error('Error getting calendar events:', error);
      throw error;
    }
  }

  async getICalEventsFromUrl(url: string): Promise<CalendarEvent[]> {
    try {
      const convertedUrl = this.convertWebcalToHttps(url);
      const events = await ical.async.fromURL(convertedUrl);
      return this.formatCalendarEvents(events);
    } catch (error) {
      console.error('Error getting calendar events from URL:', error);
      throw error;
    }
  }

  async getICalEventsFromString(icalData: string): Promise<CalendarEvent[]> {
    try {
      const events = ical.sync.parseICS(icalData);
      return this.formatCalendarEvents(events);
    } catch (error) {
      console.error('Error parsing iCal data:', error);
      throw error;
    }
  }

  private convertWebcalToHttps(url: string): string {
    return url.replace(/^webcal:\/\//i, 'https://');
  }

  private formatCalendarEvents(events: Record<string, any>): CalendarEvent[] {
    const calendarEvents: CalendarEvent[] = [];

    for (const [uid, event] of Object.entries(events)) {
      if (event.type !== 'VEVENT') continue;

      calendarEvents.push({
        summary: event.summary,
        description: event.description,
        start: event.start,
        end: event.end,
        location: event.location,
        uid: uid,
        recurrenceRule: event.rrule ? String(event.rrule) : undefined,
      });
    }

    return calendarEvents.sort((a, b) => b.start.getTime() - a.start.getTime());
  }
}
