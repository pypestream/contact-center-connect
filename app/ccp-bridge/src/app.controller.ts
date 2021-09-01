import {Body, Controller, Get, Post} from '@nestjs/common';
import {AppService} from './app.service';
import { MessageType, SendMessageResponse } from '@ccp/sdk';
import {ServiceNowWebhookBody} from '@ccp/sdk/dist/services/service-now/types';

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
        type: MessageType.Text
      },
      sender: {
        email: 'test@test.com',
        username: 'username',
      },
    });
    return sendMessageRes;
  }

  @Post('agent-webhook')
  agentWebhook(@Body() body: ServiceNowWebhookBody): string {
    const isChatEnded = this.appService.serviceNowService.isChatEnded(body);
    const isAgentMessage =
      this.appService.serviceNowService.isMessageSentByAgent(body);
    if (isChatEnded) {
      // send chat ended message to end-user
    }
    // if webhook triggered for agent message then forward it to end-user
    if (isAgentMessage) {
      const ccpMessage =
        this.appService.serviceNowService.mapToCcpMessage(body);
    }
    // then we will send it middleware api
    return null;
  }

}

// node app => module => sdk
