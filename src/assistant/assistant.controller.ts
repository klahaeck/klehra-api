import { Controller, Post, Body } from '@nestjs/common';
import { AssistantService } from './assistant.service';

@Controller('assistant')
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  @Post('chat')
  getEvents(
    @Body('message') message: string,
    @Body('thread_id') thread_id?: string,
  ): any {
    return this.assistantService.analyzeMessage(message, thread_id);
  }
}
