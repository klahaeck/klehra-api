/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { tool } from '@langchain/core/tools';
// import { ToolNode } from '@langchain/langgraph/prebuilt';
import { ChatOpenAI } from '@langchain/openai';
// import { MemorySaver } from '@langchain/langgraph';
// import { HumanMessage } from '@langchain/core/messages';
// import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { z } from 'zod';
import { CalendarService } from '../calendar/calendar.service';

@Injectable()
export class AssistantService {
  private readonly baseURL: string | undefined;
  private readonly apiKey: string | undefined;
  private readonly model: string = 'openai/gpt-4.1';
  private readonly analyzeEventsWithAI: (
    events: any,
    query: string,
  ) => Promise<any>;
  private readonly agent: any;

  constructor(
    private configService: ConfigService,
    private readonly calendarService: CalendarService,
  ) {
    this.baseURL = this.configService.get<string>('LITELLM_API_URL');
    this.apiKey = this.configService.get<string>('LITELLM_API_KEY');

    this.analyzeEventsWithAI = async (events: any, query: string) => {
      // const baseURL = this.configService.get<string>('LITELLM_API_URL');
      // const apiKey = this.configService.get<string>('LITELLM_API_KEY');
      const aiModel = new ChatOpenAI({
        model: 'openai/gpt-4.1',
        temperature: 0.2,
        configuration: {
          baseURL: this.baseURL,
          apiKey: this.apiKey,
        },
      });

      const today = new Date();

      const prompt = `
      Given these calendar events:
      ${JSON.stringify(events, null, 2)}
    
      and todays date:
      ${today.toISOString().split('T')[0]}
      
      ${query}
      
      Provide a clear, concise analysis based on the query above. Consider the events' details, such as time, location, and participants. Consider most recent and relevant events first
      If the query is about a specific event, focus on that. If it's about a general overview, summarize the events.
      Use natural language and avoid technical jargon.
      `;

      const response = await aiModel.invoke(prompt);
      return response.content;
    };

    // const agentTools = [this.getCalendarEvents()];
    // const agentModel = new ChatOpenAI({
    //   model: 'openai/gpt-4.1',
    //   temperature: 0,
    //   configuration: {
    //     baseURL: this.baseURL,
    //     apiKey: this.apiKey,
    //   },
    // });
    // const tools = [this.getCalendarEvents()];
    // const toolNode = new ToolNode(tools);

    // const modelWithTools = new ChatOpenAI({
    //   model: 'openai/gpt-4.1',
    //   temperature: 0,
    //   configuration: {
    //     baseURL: this.baseURL,
    //     apiKey: this.apiKey,
    //   },
    // }).bindTools(tools);

    // const agentCheckpointer = new MemorySaver();
    // this.agent = createReactAgent({
    //   llm: agentModel,
    //   tools: agentTools,
    //   checkpointSaver: agentCheckpointer,
    // });
  }

  // Helper function to determine date ranges from natural language queries
  async parseDateRangeFromQuery(query: string) {
    const aiModel = new ChatOpenAI({
      model: 'openai/gpt-4o',
      temperature: 0,
      configuration: {
        baseURL: this.baseURL,
        apiKey: this.apiKey,
      },
    });

    const today = new Date();
    const prompt = `
    Based on this query: "${query}"
    
    Extract the time period mentioned (today, this week, this month, etc.) and convert it to ISO date strings for start and end dates.
    Today is ${today.toISOString().split('T')[0]}.
    
    Return ONLY a JSON object with this structure:
    {
      "start": "YYYY-MM-DD", 
      "end": "YYYY-MM-DD"
    }
    
    If no time period is specified, return null for both start and end to retrieve all events.
    If a specific date or range is mentioned, use that.
    `;

    const response = await aiModel.invoke(prompt);
    try {
      // Extract JSON from the response
      let content: string;
      if (typeof response.content === 'string') {
        content = response.content;
      } else if (
        Array.isArray(response.content) &&
        response.content.length > 0 &&
        'text' in response.content[0]
      ) {
        content = response.content[0].text;
      } else {
        content = ''; // Provide a default value or handle the case where 'text' is not available
      }
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback to null (all events) if parsing fails
      return { start: null, end: null };
    } catch (e) {
      console.error('Error parsing date range:', e);
      // Fallback to null (all events)
      return { start: null, end: null };
    }
  }

  getCalendarEvents() {
    return tool(
      async (input) => {
        // If we have a natural language query but no explicit dates, parse the date range
        if (input.query && (!input.start || !input.end)) {
          const dateRange = await this.parseDateRangeFromQuery(input.query);

          // Only set start/end if they were found in the query
          if (!input.start) {
            input.start = dateRange.start;
          }

          if (!input.end) {
            input.end = dateRange.end;
          }
        }

        const events = await this.calendarService.getCalendarEvents(
          input.start,
          input.end,
        );

        // Always analyze events if we have a query
        if (input.query) {
          const analysis = await this.analyzeEventsWithAI(events, input.query);
          return {
            events,
            analysis,
            dateRange: { start: input.start, end: input.end },
          };
        }

        return events;
      },
      {
        name: 'get_calendar_events',
        description:
          'Get and analyze calendar events using natural language queries like "what does my week look like" or "how many meetings do I have today".',
        schema: z.object({
          start: z
            .string()
            .optional()
            .describe('Start date for calendar events (ISO format)'),
          end: z
            .string()
            .optional()
            .describe('End date for calendar events (ISO format)'),
          query: z
            .string()
            .describe(
              "Natural language query about calendar events (e.g., 'What does my week look like?', 'How many events do I have this month?', 'When is Edith's birthday party?')",
            ),
        }),
      },
    );
  }

  async analyzeMessage(message: string, thread_id?: string) {
    console.log(message);
    const tools = [this.getCalendarEvents()];
    // const toolNode = new ToolNode(tools);

    const modelWithTools = new ChatOpenAI({
      model: 'openai/gpt-4.1',
      temperature: 0,
      configuration: {
        baseURL: this.baseURL,
        apiKey: this.apiKey,
      },
    }).bindTools(tools);

    try {
      // Invoke the model with tools, passing the user's message
      const response = await modelWithTools.invoke(message);

      // Extract content from the response
      let contentString: string;
      if (typeof response.content === 'string') {
        contentString = response.content;
      } else if (
        Array.isArray(response.content) &&
        response.content.length > 0
      ) {
        const content = response.content[0];
        contentString =
          'text' in content ? content.text : JSON.stringify(response.content);
      } else {
        contentString = 'No response content available';
      }

      return { message: contentString };
    } catch (error) {
      console.error('Error analyzing message:', error);
      return {
        message: 'Sorry, there was an error processing your request.',
        error: error.message,
      };
    }
  }
}
