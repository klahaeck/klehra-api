import { Module } from '@nestjs/common';
import { ToolService } from './tool.service';
import { ToolController } from './tool.controller';
import { CalendarModule } from 'src/calendar/calendar.module';

@Module({
  imports: [CalendarModule],
  providers: [ToolService],
  controllers: [ToolController],
})
export class ToolModule {}
