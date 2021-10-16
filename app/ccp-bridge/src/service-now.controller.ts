import { Controller, Post, Req, Res, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { SendMessageResponse, ServiceNowWebhookBody } from '@ccp/sdk';
import { AxiosResponse } from 'axios';
import { Request, Response } from 'express';
import * as getRawBody from 'raw-body';

@Controller('agent')
export class ServiceNowController {
  constructor(private readonly appService: AppService) {}

  @Post('webhook')
  async message(@Req() req: Request, @Res() res: Response) {
    const rawBody = await getRawBody(req);
    const body: ServiceNowWebhookBody = JSON.parse(rawBody.toString());

    const hasChatEndedAction =
      this.appService.serviceNowService.hasEndConversationAction(body);
    if (hasChatEndedAction) {
      await this.appService.middlewareApiService.endConversation(
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
          await this.appService.middlewareApiService.sendMessage(message);
        }
      }
    }
    const hasTypingIndicatorAction =
      this.appService.serviceNowService.hasTypingIndicatorAction(body);
    if (hasTypingIndicatorAction) {
      const isTyping = this.appService.serviceNowService.isTyping(body);
      await this.appService.middlewareApiService.sendTyping(
        body.clientSessionId,
        isTyping,
      );
    }
    console.log('4');
    return res.status(HttpStatus.OK).end();
  }
}

// node app => module => sdk
