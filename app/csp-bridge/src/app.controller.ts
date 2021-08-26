import { Controller, Get, Post, Res, Response } from '@nestjs/common';
import { AppService } from './app.service';
import {SendMessageResponse} from "@csp/sdk/dist/services/common/interfaces";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): any {
    return 'Hello World!';
  }

  @Get('send-to-agent')
  async sendToAgent(): Promise<SendMessageResponse> {
    const sendMessageRes = await this.appService.serviceNowService.sendMessage({
      conversationId: 'conversationId',
      skill: 'english',
      message: {
        id: '123',
        value: '123',
      },
      sender: {
        email: 'test@test.com',
        username: 'username',
      },
    });
    return sendMessageRes;
  }

  @Post('send-to-end-user')
  sendToEndUser(): string {
    return null;
  }
}

// node app => module => sdk