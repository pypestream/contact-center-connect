import { Controller, Post, Req, Res, HttpStatus } from '@nestjs/common';
import { ServiceNowService } from './service';
import { ServiceNowWebhookBody } from './types';
import { Request, Response } from 'express';
import { PostBody } from './dto';
import { Body } from '@nestjs/common';

@Controller('service-now')
export class ServiceNowController {
  private serviceNowService: ServiceNowService;

  constructor() {
    this.serviceNowService = new ServiceNowService();
  }

  @Post('webhook')
  async message(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: PostBody,
  ) {
    const endUserService = this.serviceNowService.getEndUserService(
      body as ServiceNowWebhookBody,
    );
    if (!endUserService) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send({ message: 'Not able to get endUserService' });
    }
    const requests = [];

    const hasChatEndedAction = this.serviceNowService.hasEndConversationAction(
      body as ServiceNowWebhookBody,
    );
    if (hasChatEndedAction) {
      const endConversationRequest = await endUserService.endConversation(
        body.clientSessionId,
      );
      requests.push(endConversationRequest);
    }
    const hasNewMessageAction = this.serviceNowService.hasNewMessageAction(
      body as ServiceNowWebhookBody,
    );

    if (hasNewMessageAction) {
      for (let i = 0; i < (body as ServiceNowWebhookBody).body.length; i++) {
        const message = this.serviceNowService.mapToCccMessage(
          body as ServiceNowWebhookBody,
          {
            index: i,
          },
        );
        if (message) {
          const sendMessageRequest = endUserService.sendMessage(message);
          requests.push(sendMessageRequest);
        }
      }
    }
    const hasTypingIndicatorAction =
      this.serviceNowService.hasTypingIndicatorAction(
        body as ServiceNowWebhookBody,
      );
    if (hasTypingIndicatorAction) {
      const isTyping = this.serviceNowService.isTyping(
        body as ServiceNowWebhookBody,
      );
      const sendTypingRequest = endUserService.sendTyping(
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
