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
import { FeatureFlagEnum } from '../feature-flag/feature-flag.enum';
import { FeatureFlagService } from '../feature-flag/feature-flag.service';

@UseInterceptors(BodyInterceptor)
@Controller('service-now')
export class ServiceNowController {
  constructor(
    private readonly serviceNowService: ServiceNowService,
    private readonly middlewareApiService: MiddlewareApiService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  @Post('webhook')
  async message(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: PostBody,
  ) {
    const requests = [];

    const hasWaitTimeAction = this.serviceNowService.hasWaitTime(
      body as ServiceNowWebhookBody,
    );
    if (hasWaitTimeAction) {
      const waitTime: number = this.serviceNowService.getWaitTime(
        body as ServiceNowWebhookBody,
      );
      const sendWaitTimeRequest = this.middlewareApiService.sendWaitTime(
        body.clientSessionId,
        waitTime,
      );
      requests.push(sendWaitTimeRequest);
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

    const isPE20890FlagEnabled = await this.featureFlagService.isFlagEnabled(
      FeatureFlagEnum.PE_20890,
    );
    if (isPE20890FlagEnabled) {
      try {
        const responses = await Promise.all(requests);
        const data = responses.map((r) => r.data);
        const hasChatEndedAction =
          this.serviceNowService.hasEndConversationAction(
            body as ServiceNowWebhookBody,
          );
        if (hasChatEndedAction) {
          const endConversationResponse =
            await this.middlewareApiService.endConversation(
              body.clientSessionId,
            );
          return res
            .status(HttpStatus.OK)
            .send([...data, endConversationResponse.data]);
        } else {
          return res.status(HttpStatus.OK).send(data);
        }
      } catch (err) {
        return res.status(HttpStatus.BAD_REQUEST).send(err);
      }
    } else {
      const hasChatEndedAction =
        this.serviceNowService.hasEndConversationAction(
          body as ServiceNowWebhookBody,
        );
      if (hasChatEndedAction) {
        const endConversationRequest =
          this.middlewareApiService.endConversation(body.clientSessionId);
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
}
