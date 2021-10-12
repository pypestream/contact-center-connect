import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { SendMessageResponse, ServiceNowWebhookBody } from '@ccp/sdk';
import { AxiosResponse } from 'axios';

@Controller('agent')
export class AgentController {
  constructor(private readonly appService: AppService) {}

  @Post('message')
  async message(
    @Body() body: ServiceNowWebhookBody,
  ): Promise<SendMessageResponse> {
    let res: AxiosResponse<any>;
    const hasTypingIndicatorAction =
      this.appService.serviceNowService.hasTypingIndicatorAction(body);
    if (hasTypingIndicatorAction) {
      const isTyping = this.appService.serviceNowService.isTyping(body);
      res = await this.appService.middlewareApiService.sendTyping(
        body.clientSessionId,
        isTyping,
      );
    }
    const hasChatEndedAction =
      this.appService.serviceNowService.hasEndConversationAction(body);
    if (hasChatEndedAction) {
      res = await this.appService.middlewareApiService.sendEnd(
        body.clientSessionId,
      );
    }

    const hasNewMessageAction =
      this.appService.serviceNowService.hasNewMessageAction(body);
    if (hasNewMessageAction) {
      for (let i = 0; i < body.body.length; i++) {
        const message = this.appService.serviceNowService.mapToCcpMessage(
          body,
          { index: i },
        );
        if (message) {
          res = await this.appService.middlewareApiService.sendMessage(message);
        }
      }
      return {
        message: res.data.content,
        status: res.status,
      };
    }
  }
}

// node app => module => sdk
