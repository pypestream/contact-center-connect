import {
  Controller,
  Get,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
} from '@nestjs/common';

import { Response, Request } from 'express';
import { Ccc } from '../../ccc';
import { MessageType, AgentServices } from '../../types';
import { components, operations } from './types/openapi-types';
import { MiddlewareApiService } from './service';

import * as getRawBody from 'raw-body';
import { cccToken } from '../../constants';

@Controller('contactCenter/v1')
export class MiddlewareApiController {
  private readonly ccc: Ccc;

  private readonly middlewareApiService: MiddlewareApiService;
  constructor(@Inject(cccToken) ccc: Ccc) {
    this.ccc = ccc;
    this.middlewareApiService = new MiddlewareApiService(ccc.middlewareApi);
  }

  @Put('settings')
  async putSettings(): Promise<components['schemas']['Setting']> {
    const sendMessageRes = await this.middlewareApiService.putSettings({
      callbackToken: 'abc',
      callbackURL: process.env.CCC_URL,
      integrationName: 'ServiceNow',
      integrationFields: {},
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
    return {
      estimatedWaitTime: 60,
    };
  }

  @Post('/conversations/:conversationId/escalate')
  async escalate(
    @Param('conversationId') conversationId,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    // TODO: history middleware api is not implemented
    // const historyResponse = await this.middlewareApiService
    //   .history(conversationId)
    //   .catch(err => {
    //     return err.response;
    //   });

    const rawBody = await getRawBody(req);
    const body: components['schemas']['Escalate'] = JSON.parse(
      rawBody.toString(),
    );
    try {
      const agentService: AgentServices =
        this.middlewareApiService.getAgentService(
          req,
          this.middlewareApiService,
        );
      await agentService.startConversation({
        conversationId: conversationId,
        skill: body.skill,
        message: {
          id: '',
          value: '',
          type: MessageType.Text,
        },
        sender: {
          email: 'test@test.com',
          username: body.userId,
        },
      });
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
      return res.status(HttpStatus.BAD_REQUEST).json({
        errors: [],
        message: ex.message,
      });
    }
  }

  @Post('/conversations/:conversationId/type')
  async type(
    @Req() req: Request,
    @Param('conversationId') conversationId,
    @Res() res: Response,
  ) {
    const rawBody = await getRawBody(req, { encoding: true });
    const body: components['schemas']['Typing'] = JSON.parse(
      rawBody.toString(),
    );
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
  ) {
    const rawBody = await getRawBody(req, { encoding: true });
    const body: components['schemas']['Message'] = JSON.parse(
      rawBody.toString(),
    );
    const cccMessage = this.middlewareApiService.mapToCccMessage(body, {
      conversationId,
      messageId,
    });
    const agentService: AgentServices =
      this.middlewareApiService.getAgentService(req, this.middlewareApiService);
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
    await service.endConversation(conversationId);
    return res.status(HttpStatus.NO_CONTENT).end();
  }
}
