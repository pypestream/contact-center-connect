import {
  Controller,
  Post,
  Req,
  Res,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { MessageType } from './../common/types';
import { FlexService } from './flex.service';
import { MiddlewareApiService } from '../middleware-api/middleware-api.service';
import { FlexWebhookBody } from './types';
import { Request, Response } from 'express';
import { PostBody } from './dto';
import { Body } from '@nestjs/common';
import { BodyInterceptor } from '../common/interceptors/body.interceptor';
import {
  agentJoinedChatMessage,
  agentLeftChatMessage,
} from '../common/messages-templates';

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
    const chatId = this.flexService.getChatId(body as FlexWebhookBody);

    const requests = [];

    if (this.flexService.hasAgentJoinedChat(body as FlexWebhookBody)) {
      const message = {
        message: {
          value: agentJoinedChatMessage,
          type: MessageType.Text,
          id: uuidv4(),
        },
        sender: {
          username: 'test-agent',
        },
        conversationId: chatId,
      };
      await this.middlewareApiService.sendMessage(message);
    }

    if (this.flexService.hasAgentLeftChat(body as FlexWebhookBody)) {
      const message = {
        message: {
          value: agentLeftChatMessage,
          type: MessageType.Text,
          id: uuidv4(),
        },
        sender: {
          username: 'test-agent',
        },
        conversationId: chatId,
      };
      await this.middlewareApiService.sendMessage(message);
      await this.middlewareApiService.endConversation(chatId);
    }

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
