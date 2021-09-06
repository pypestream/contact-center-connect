import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { MessageType, SendMessageResponse } from '@ccp/sdk';

@Controller('agent')
export class AgentController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): any {
    return 'Hello World!';
  }

  @Get('message')
  async message(): Promise<SendMessageResponse> {
    const sendMessageRes =
      await this.appService.middlewareApiService.sendMessage({
        conversationId: 'conversationId',
        skill: 'english',
        message: {
          id: '123',
          value: 'test message',
          type: MessageType.Text,
        },
        sender: {
          email: 'test@test.com',
          username: 'username',
        },
      });
    return {
      message: sendMessageRes.data.content,
      status: sendMessageRes.status,
    };
  }
}

// node app => module => sdk
