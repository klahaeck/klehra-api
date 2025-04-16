import { Controller, Get, Query } from '@nestjs/common';
// import { ToolService } from './tool.service';
import { CalendarService } from '../calendar/calendar.service';
import { CalendarEvent } from 'src/ical/ical.service';
import {
  ApiOperation,
  ApiParam,
  // ApiBody,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { ApiProperty } from '@nestjs/swagger';

// class CalendarRequest {
//   @ApiProperty({
//     description: 'Start date for calendar events (ISO format)',
//     // example: 'What does my week look like?'
//   })
//   start: string;

//   @ApiProperty({
//     description: 'End date for calendar events (ISO format)',
//     // example: 'What does my week look like?'
//   })
//   end: string;
// }

class CalendarResponse {
  @ApiProperty({
    description: 'The result of calendar query',
    // example: 'You have 3 meetings this week.',
  })
  results: CalendarEvent[];

  @ApiProperty({
    description: 'The date of the query',
    // example: '2023-10-01T00:00:00Z',
  })
  today: string;
  // @ApiProperty({
}

@ApiTags('tools')
@Controller('tools')
export class ToolController {
  constructor(
    // private readonly toolService: ToolService,
    private readonly calendarService: CalendarService,
  ) {}

  // @Get()
  // getEventsOpenAI(): any {
  //   return this.toolService.getOpenAIConfig();
  // }

  @Get('get_calendar_events')
  @ApiOperation({
    summary: 'Executes get_calendar_events',
    description:
      "Natural language query about calendar events (e.g., 'What does my week look like?', 'How many events do I have this month?', 'When is Edith's birthday party?')",
  })
  @ApiParam({
    name: 'start',
    required: false,
    description: 'Start date for calendar events (ISO format)',
    type: 'string',
  })
  @ApiParam({
    name: 'end',
    required: false,
    description: 'End date for calendar events (ISO format)',
    type: 'string',
  })
  @ApiResponse({ status: 200, description: 'Success', type: CalendarResponse })
  async getCalendarEvents(
    @Query('start') start: string,
    @Query('end') end: string,
  ): Promise<CalendarResponse> {
    console.log('get_calendar_events called');
    const events = await this.calendarService.getCalendarEvents(start, end);
    return {
      today: new Date().toISOString(),
      results: events,
    };
  }
}
