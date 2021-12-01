import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  Query,
  Render,
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
import { Ccc } from '../../ccc';
import { MessageType, AgentServices } from '../common/types';
import { components, operations } from './types/openapi-types';
import { MiddlewareApiService } from './service';

import { cccToken } from '../common/constants';
import { Body } from '@nestjs/common';

@Controller('contactCenter/v1')
export class MiddlewareApiController {
  private readonly ccc: Ccc;

  private readonly middlewareApiService: MiddlewareApiService;
  constructor(@Inject(cccToken) ccc: Ccc) {
    this.ccc = ccc;
    this.middlewareApiService = new MiddlewareApiService(ccc.middlewareApi);
  }

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
    @Req() req: Request,
  ): Promise<components['schemas']['AgentAvailability']> {
    if (!query.skill) {
      throw new HttpException(
        'Skill param is required parameter',
        HttpStatus.BAD_REQUEST,
      );
    }
    const agentService: AgentServices =
      this.middlewareApiService.getAgentService(req, this.middlewareApiService);
    const isAvailable = agentService.isAvailable(query.skill);
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

  @Post('/conversations/:conversationId/escalate')
  async escalate(
    @Param('conversationId') conversationId,
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: PostEscalateBody,
  ) {
    const historyResponse = await this.middlewareApiService
      .history(conversationId)
      .catch((err) => {
        return {
          data: { messages: [] },
        };
      });

    try {
      const agentService: AgentServices =
        this.middlewareApiService.getAgentService(
          req,
          this.middlewareApiService,
        );
      const history: string = historyResponse.data.messages
        .map((m) => m.content)
        .join('\r\n');
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
      await agentService.startConversation(message);
      const json: components['schemas']['EscalateResponse'] = {
        agentId: 'test-agent',
        escalationId: conversationId,
        /** Estimated wait time in seconds */
        estimatedWaitTime: 0,
        /** The user position in the chat queue. */
        queuePosition: 0,
        /** (accepted, queued) */
        status: 'queued',
      };
      return res.status(HttpStatus.CREATED).json(json);
    } catch (ex) {
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
      this.middlewareApiService.getAgentService(req, this.middlewareApiService);
    await agentService.sendTyping(conversationId, body.typing);
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
      this.middlewareApiService.getAgentService(req, this.middlewareApiService);
    await agentService.sendTyping(cccMessage.conversationId, false);
    await agentService.sendMessage(cccMessage);

    return res.status(HttpStatus.NO_CONTENT).end();
  }

  @Post('/conversations/:conversationId/end')
  async conversationEnd(
    @Param('conversationId') conversationId,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const service: AgentServices = this.middlewareApiService.getAgentService(
      req,
      this.middlewareApiService,
    );
    await service.sendTyping(conversationId, false);
    await service.endConversation(conversationId);
    return res.status(HttpStatus.NO_CONTENT).end();
  }
}
