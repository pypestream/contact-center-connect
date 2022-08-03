import {
  Controller,
  Post,
  Req,
  Res,
  Logger,
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
  private readonly logger = new Logger(LivePersonController.name);

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
    let chatId = null;
    if (body.body.changes[0].result) {
      chatId = body.body.changes[0].result.convId;
    } else if (body.body.changes[0].conversationId) {
      chatId = body.body.changes[0].conversationId;
    }
    if (!chatId) {
      throw new Error(
        'LivePerson error: Not able to find chatId for body: ' + body,
      );
    }

    const requests = [];

    if (
      await this.livePersonService.hasAgentJoinedChat(
        body as LivePersonWebhookBody,
      )
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
      await this.middlewareApiService.agentAcceptedEscalation(chatId);
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

    const isTyping = this.livePersonService.isTyping(
      body as LivePersonWebhookBody,
    );
    if (isTyping) {
      const sendTypingRequest = this.middlewareApiService.sendTyping(
        chatId,
        isTyping,
      );
      requests.push(sendTypingRequest);
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
        this.logger.error(
          `LivePersonController error: ${err.message}, stack: ${err.stack}`,
        );
        return res.status(HttpStatus.BAD_REQUEST).send(err);
      });
  }
}
