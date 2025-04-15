import { Module } from '@nestjs/common';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import { ICalModule } from '../ical/ical.module';

@Module({
  imports: [ICalModule],
  controllers: [CalendarController],
  providers: [CalendarService],
  // exports: [CalendarService],
})
export class CalendarModule {}
