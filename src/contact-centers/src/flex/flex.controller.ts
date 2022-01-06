import {
  Controller,
  Post,
  Req,
  Res,
  HttpStatus,
  UseInterceptors,
  Get,
} from '@nestjs/common';
import { FlexService } from './flex.service';
import { MiddlewareApiService } from '../middleware-api/middleware-api.service';
import { FlexWebhookBody } from './types';
import { Request, Response } from 'express';
import { PostBody } from './dto';
import { Body } from '@nestjs/common';
import { BodyInterceptor } from '../common/interceptors/body.interceptor';

@UseInterceptors(BodyInterceptor)
@Controller('flex')
export class FlexController {
  constructor(
    private readonly flexService: FlexService,
    private readonly middlewareApiService: MiddlewareApiService,
  ) {}

  @Post('webhook')
  async message(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: PostBody,
  ) {
    const chatId = await this.flexService.getConversationIdFromChannelId(
      body.AccountSid,
      body.InstanceSid,
      body.ChannelSid,
    );
    const requests = [];

    const hasNewMessageAction = this.flexService.hasNewMessageAction(
      body as FlexWebhookBody,
    );

    if (hasNewMessageAction) {
      const message = this.flexService.mapToCccMessage(body as FlexWebhookBody);
      message.conversationId = chatId;
      if (message) {
        const sendMessageRequest =
          this.middlewareApiService.sendMessage(message);
        requests.push(sendMessageRequest);
      }
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
