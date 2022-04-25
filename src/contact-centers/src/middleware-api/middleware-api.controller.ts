import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  PostEscalateBody,
  PostTypingBody,
  PutMessageBody,
  PutSettingsBody,
} from './dto';

import { Response, Request } from 'express';
import { MessageType, AgentServices } from '../common/types';
import { components, operations } from './types/openapi-types';
import { MiddlewareApiService } from './middleware-api.service';

import { Body } from '@nestjs/common';
import { GenesysService } from '../genesys/genesys.service';
import { FlexService } from '../flex/flex.service';
import { AgentFactoryService } from '../agent-factory/agent-factory.service';
import { UseInterceptors } from '@nestjs/common';
import { BodyInterceptor } from '../common/interceptors/body.interceptor';
import { FeatureFlagService } from '../feature-flag/feature-flag.service';
import { FeatureFlagEnum } from '../feature-flag/feature-flag.enum';

@UseInterceptors(BodyInterceptor)
@Controller('contactCenter/v1')
export class MiddlewareApiController {
  private readonly logger = new Logger(MiddlewareApiController.name);

  constructor(
    private readonly agentFactoryService: AgentFactoryService,
    private readonly middlewareApiService: MiddlewareApiService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  @Put('settings')
  async putSettings(
    @Body() body: PutSettingsBody,
  ): Promise<components['schemas']['Setting']> {
    const sendMessageRes = await this.middlewareApiService.putSettings({
      callbackToken: body.callbackToken,
      callbackURL: body.callbackURL,
      integrationName: body.integrationName,
      integrationFields: body.integrationFields,
    });
    return sendMessageRes.data;
  }

  @Get('settings')
  async settings(): Promise<components['schemas']['Setting']> {
    const sendMessageRes = await this.middlewareApiService.getSettings();
    return sendMessageRes.data;
  }

  @Get('/agents/availability')
  async availability(
    @Query() query: operations['checkAgentAvailability']['parameters']['query'],
  ): Promise<components['schemas']['AgentAvailability']> {
    if (!query.skill) {
      throw new HttpException(
        'Skill param is required parameter',
        HttpStatus.BAD_REQUEST,
      );
    }
    const agentService: AgentServices =
      this.agentFactoryService.getAgentService();
    const isAvailable = await agentService.isAvailable(query.skill);
    return {
      available: isAvailable,
      estimatedWaitTime: 30,
      status: isAvailable ? 'available' : 'unavailable',
      hoursOfOperation: true,
      queueDepth: 10,
    };
  }

  @Get('/agents/waitTime')
  async waitTime(
    @Query() query: operations['agentWaitTime']['parameters']['query'],
  ): Promise<components['schemas']['WaitTime']> {
    if (!query.skill) {
      throw new HttpException(
        'Skill param is required parameter',
        HttpStatus.BAD_REQUEST,
      );
    }
    return {
      estimatedWaitTime: 60,
    };
  }

  private async getHistory(conversationId: string): Promise<string> {
    const historyResponse = await this.middlewareApiService
      .history(conversationId)
      .catch(() => {
        return {
          data: { messages: [] },
        };
      });
    const history: string = historyResponse.data.messages
      .reverse()
      .filter((m) => m.content && m.content.text)
      .map((m) => {
        let side = '';
        if (m.side === 'anonymous_consumer') {
          side = 'microapp user';
        } else if (m.side === 'bot') {
          side = 'microapp bot';
        } else {
          side = m.side;
        }
        return `[side:${side}] ${m.content.text}`;
      })
      .join('\r\n');
    return history;
  }

  @Post('/conversations/:conversationId/escalate')
  async escalate(
    @Param('conversationId') conversationId,
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: PostEscalateBody,
  ) {
    try {
      const agentService: AgentServices =
        this.agentFactoryService.getAgentService();
      const isHistoryFlagEnabled = await this.featureFlagService.isFlagEnabled(
        FeatureFlagEnum.History,
      );
      const history = isHistoryFlagEnabled
        ? await this.getHistory(conversationId)
        : 'Escalated from chat';

      const messageId = uuidv4();
      const message = {
        conversationId: conversationId,
        skill: body.skill,
        message: {
          id: messageId,
          value: history,
          type: MessageType.Text,
        },
        sender: {
          email: 'test@test.com',
          username: body.userId,
        },
      };

      const resp = await agentService.startConversation(message);

      const json: components['schemas']['EscalateResponse'] = {
        agentId: 'test-agent',
        escalationId: resp.data.escalationId,
        /** Estimated wait time in seconds */
        estimatedWaitTime: 0,
        /** The user position in the chat queue. */
        queuePosition: 0,
        /** (accepted, queued) */
        status: 'accepted',
      };
      return res.status(HttpStatus.CREATED).json(json);
    } catch (ex) {
      this.logger.error(
        `Start new conversation: ${ex.message}, stack: ${ex.stack}`,
      );
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        errors: [ex.message],
        message: ex.message,
      });
    }
  }

  @Post('/conversations/:conversationId/type')
  async type(
    @Req() req: Request,
    @Param('conversationId') conversationId,
    @Res() res: Response,
    @Body() body: PostTypingBody,
  ) {
    const agentService: AgentServices =
      this.agentFactoryService.getAgentService();
    if (
      !(
        agentService instanceof GenesysService ||
        agentService instanceof FlexService
      )
    ) {
      await agentService
        .sendTyping(conversationId, body.typing)
        .catch((err) =>
          this.logger.error(
            `Sync typing indicator: ${err.message} stack:${err.stack}`,
          ),
        );
    } else {
      this.logger.log('sync typing indicator is not supported');
    }
    res.status(HttpStatus.NO_CONTENT).end();
  }

  @Put('/conversations/:conversationId/messages/:messageId')
  async message(
    @Param('conversationId') conversationId,
    @Param('messageId') messageId,
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: PutMessageBody,
  ) {
    const cccMessage = this.middlewareApiService.mapToCccMessage(body, {
      conversationId,
      messageId,
    });

    const agentService: AgentServices =
      this.agentFactoryService.getAgentService();

    if (
      !(
        agentService instanceof GenesysService ||
        agentService instanceof FlexService
      )
    ) {
      this.logger.log('set typing indicator to false');
      await agentService.sendTyping(conversationId, false);
    }
    try {
      await agentService.sendMessage(cccMessage);
      return res.status(HttpStatus.NO_CONTENT).end();
    } catch (err) {
      this.logger.error(
        `Send message to agent: ${err.message}, stack:${err.stack}`,
      );
      return res.status(HttpStatus.BAD_REQUEST).end();
    }
  }

  @Post('/conversations/:conversationId/end')
  async conversationEnd(
    @Param('conversationId') conversationId,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const service: AgentServices = this.agentFactoryService.getAgentService();
    if (
      !(service instanceof GenesysService || service instanceof FlexService)
    ) {
      this.logger.log('conversation end: set typing indicator to false');
      await service
        .sendTyping(conversationId, false)
        .catch((err) =>
          this.logger.error(
            `Set typing indicator: ${err.message}, stack: ${err.stack}`,
          ),
        );
    }
    try {
      await service.endConversation(conversationId);
      return res.status(HttpStatus.NO_CONTENT).end();
    } catch (err) {
      this.logger.error(`end-conversation error:${err.message}, ${err.stack}`);
      return res.status(HttpStatus.BAD_REQUEST).end();
    }
  }
}
