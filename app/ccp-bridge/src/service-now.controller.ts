import { Controller, Post, Req, Res, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { ServiceNowWebhookBody } from '@ccp/sdk';
import { Request, Response } from 'express';
import * as getRawBody from 'raw-body';

@Controller('service-now')
export class ServiceNowController {
  constructor(private readonly appService: AppService) {}

  @Post('webhook')
  async message(@Req() req: Request, @Res() res: Response) {
    const rawBody = await getRawBody(req);
    const body: ServiceNowWebhookBody = JSON.parse(rawBody.toString());

    const requests = [];

    const hasChatEndedAction =
      this.appService.serviceNowService.hasEndConversationAction(body);
    if (hasChatEndedAction) {
      const endConversationRequest =
        await this.appService.middlewareApiService.endConversation(
          body.clientSessionId,
        );
      requests.push(endConversationRequest);
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
          const sendMessageRequest =
            this.appService.middlewareApiService.sendMessage(message);
          requests.push(sendMessageRequest);
        }
      }
    }
    const hasTypingIndicatorAction =
      this.appService.serviceNowService.hasTypingIndicatorAction(body);
    if (hasTypingIndicatorAction) {
      const isTyping = this.appService.serviceNowService.isTyping(body);
      const sendTypingRequest = this.appService.middlewareApiService.sendTyping(
        body.clientSessionId,
        isTyping,
      );
      requests.push(sendTypingRequest);
    }
    Promise.all(requests)
      .then((responses) => {
        const data = responses.map((r) => r.data);
        return res.status(HttpStatus.OK).send(data);
      })
      .catch((err) => {
        return res.status(HttpStatus.BAD_REQUEST).send(err);
      });
  }
}

// node app => module => sdk
