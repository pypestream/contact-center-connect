import {
  Controller,
  Post,
  Req,
  Res,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { ServiceNowService } from './service-now.service';
import { MiddlewareApiService } from '../middleware-api/middleware-api.service';
import { ServiceNowWebhookBody } from './types';
import { Request, Response } from 'express';
import { PostBody } from './dto';
import { Body } from '@nestjs/common';
import { BodyInterceptor } from '../common/interceptors/body.interceptor';

@UseInterceptors(BodyInterceptor)
@Controller('service-now')
export class ServiceNowController {
  constructor(
    private readonly serviceNowService: ServiceNowService,
    private readonly middlewareApiService: MiddlewareApiService,
  ) {}

  @Post('webhook')
  async message(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: PostBody,
  ) {
    const requests = [];

    const hasChatEndedAction = this.serviceNowService.hasEndConversationAction(
      body as ServiceNowWebhookBody,
    );
    if (hasChatEndedAction) {
      const endConversationRequest =
        await this.middlewareApiService.endConversation(body.clientSessionId);
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
          const sendMessageRequest =
            this.middlewareApiService.sendMessage(message);
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
      const sendTypingRequest = this.middlewareApiService.sendTyping(
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
