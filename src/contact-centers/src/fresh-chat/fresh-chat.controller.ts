import {
  Controller,
  Post,
  Req,
  Res,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { FreshChatService } from './fresh-chat.service';
import { MiddlewareApiService } from '../middleware-api/middleware-api.service';
import { FreshChatWebhookBody } from './types';
import { Request, Response } from 'express';
import { PostBody } from './dto';
import { Body } from '@nestjs/common';
import { BodyInterceptor } from '../common/interceptors/body.interceptor';

@UseInterceptors(BodyInterceptor)
@Controller('fresh-chat')
export class FreshChatController {
  constructor(
    private readonly serviceNowService: FreshChatService,
    private readonly middlewareApiService: MiddlewareApiService,
  ) {}

  @Post('webhook')
  async message(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: PostBody,
  ) {
    const requests = [];

    const hasNewMessageAction = this.serviceNowService.hasNewMessageAction(
      body as FreshChatWebhookBody,
    );

    if (hasNewMessageAction) {
      const message = this.serviceNowService.mapToCccMessage(
        body as FreshChatWebhookBody,
      );
      const sendMessageRequest = this.middlewareApiService.sendMessage(message);
      requests.push(sendMessageRequest);
    }

    const hasChatEndedAction = this.serviceNowService.hasEndConversationAction(
      body as FreshChatWebhookBody,
    );
    if (hasChatEndedAction) {
      const endConversationRequest = this.middlewareApiService.endConversation(
        body.data.message.conversation_id,
      );
      requests.push(endConversationRequest);
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
