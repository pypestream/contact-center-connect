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
import { LivePersonService } from './liveperson.service';
import { MiddlewareApiService } from '../middleware-api/middleware-api.service';
import { LivePersonWebhookBody } from './types';
import { Request, Response } from 'express';
import { PostBody } from './dto';
import { Body } from '@nestjs/common';
import { BodyInterceptor } from '../common/interceptors/body.interceptor';
import {
  agentJoinedChatMessage,
  agentLeftChatMessage,
} from '../common/messages-templates';

@UseInterceptors(BodyInterceptor)
@Controller('liveperson')
export class LivePersonController {
  constructor(
    private readonly livePersonService: LivePersonService,
    private readonly middlewareApiService: MiddlewareApiService,
  ) {}

  @Post('webhook')
  async message(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: PostBody,
  ) {
    const chatId = this.livePersonService.getChatId(
      body as LivePersonWebhookBody,
    );

    const requests = [];

    if (
      this.livePersonService.hasAgentJoinedChat(body as LivePersonWebhookBody)
    ) {
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

    if (
      this.livePersonService.hasAgentLeftChat(body as LivePersonWebhookBody)
    ) {
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

    const hasNewMessageAction = this.livePersonService.hasNewMessageAction(
      body as LivePersonWebhookBody,
    );

    if (hasNewMessageAction) {
      const message = this.livePersonService.mapToCccMessage(
        body as LivePersonWebhookBody,
      );
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
