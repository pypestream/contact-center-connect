import { v4 as uuidv4 } from 'uuid';
import {
  Controller,
  Post,
  Req,
  Res,
  HttpStatus,
  UseInterceptors,
  Get,
} from '@nestjs/common';
import axios from 'axios';

import { MessageType } from './../common/types';
import { AmazonConnectService } from './amazon-connect.service';
import { MiddlewareApiService } from '../middleware-api/middleware-api.service';
import {
  AmazonConnectWebhookBody,
  MessageBody,
  VerificationBody,
} from './types';
import { Request, Response } from 'express';
import { PostBody } from './dto';
import { Body } from '@nestjs/common';
import { BodyInterceptor } from '../common/interceptors/body.interceptor';

import {
  agentJoinedChatMessage,
  agentLeftChatMessage,
} from '../common/messages-templates';

@UseInterceptors(BodyInterceptor)
@Controller('amazon-connect')
export class AmazonConnectController {
  constructor(
    private readonly amazonConnectService: AmazonConnectService,
    private readonly middlewareApiService: MiddlewareApiService,
  ) {}

  @Post('webhook')
  async message(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: PostBody,
  ) {
    const requests = [];

    if (body.Type === 'SubscriptionConfirmation') {
      //Verification the webhook url
      axios
        .get((body as VerificationBody).SubscribeURL)
        .catch(function (error) {
          // already verify?
        });
      return res.status(HttpStatus.OK).send({ message: 'Verify OK' });
    }

    const hasNewMessageAction = this.amazonConnectService.hasNewMessageAction(
      body as MessageBody,
    );

    if (hasNewMessageAction) {
      const message = this.amazonConnectService.mapToCccMessage(
        body as MessageBody,
      );
      if (message) {
        const sendMessageRequest =
          this.middlewareApiService.sendMessage(message);
        requests.push(sendMessageRequest);
      }
    }

    const hasChatEndedAction =
      this.amazonConnectService.hasEndConversationAction(body as MessageBody);
    if (hasChatEndedAction) {
      const message = {
        message: {
          value: agentLeftChatMessage,
          type: MessageType.Text,
          id: uuidv4(),
        },
        sender: {
          username: 'test-agent',
        },
        conversationId: (body as MessageBody).InitialContactId,
      };
      await this.middlewareApiService.sendMessage(message);
      await this.middlewareApiService.endConversation(
        (body as MessageBody).InitialContactId,
      );
    }

    const isTyping = this.amazonConnectService.isTyping(body as MessageBody);
    if (isTyping) {
      const sendTypingRequest = this.middlewareApiService.sendTyping(
        (body as MessageBody).InitialContactId,
        isTyping,
      );
      requests.push(sendTypingRequest);
    }

    const hasAgentJoined = this.amazonConnectService.hasAgentJoined(
      body as MessageBody,
    );
    if (hasAgentJoined) {
      const message = {
        message: {
          value: agentJoinedChatMessage,
          type: MessageType.Text,
          id: uuidv4(),
        },
        sender: {
          username: 'test-agent',
        },
        conversationId: (body as MessageBody).InitialContactId,
      };
      await this.middlewareApiService.agentAcceptedEscalation(
        (body as MessageBody).InitialContactId,
      );

      const hasAgentJoinedMessage =
        this.middlewareApiService.sendMessage(message);
      requests.push(hasAgentJoinedMessage);
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
