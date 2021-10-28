import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
} from '@nestjs/common';

import { Response, Request } from 'express';
import { AppService } from './app.service';
import {
  MessageType,
  middlewareApiComponents,
  middlewareApiOperations,
} from '@ccp/sdk';
import * as getRawBody from 'raw-body';
import { AgentServices } from '@ccp/sdk';

@Controller('contactCenter/v1')
export class MiddlewareApiController {
  constructor(private readonly appService: AppService) {}

  @Put('settings')
  async putSettings(): Promise<middlewareApiComponents['schemas']['Setting']> {
    const sendMessageRes =
      await this.appService.middlewareApiService.putSettings({
        callbackToken: 'abc',
        callbackURL: this.appService.config.ccp.instanceUrl,
        integrationName: 'ServiceNow',
        integrationFields: {},
      });
    return sendMessageRes.data;
  }

  @Get('settings')
  async settings(): Promise<middlewareApiComponents['schemas']['Setting']> {
    const sendMessageRes =
      await this.appService.middlewareApiService.getSettings();
    return sendMessageRes.data;
  }

  @Get('/agents/availability')
  async availability(
    @Query()
    query: middlewareApiOperations['checkAgentAvailability']['parameters']['query'],
    @Req() req: Request,
  ): Promise<middlewareApiComponents['schemas']['AgentAvailability']> {
    const agentService: AgentServices =
      this.appService.middlewareApiService.getAgentService(req);
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
    @Query()
    query: middlewareApiOperations['agentWaitTime']['parameters']['query'],
  ): Promise<middlewareApiComponents['schemas']['WaitTime']> {
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
    // const historyResponse = await this.appService.middlewareApiService
    //   .history(conversationId)
    //   .catch(err => {
    //     return err.response;
    //   });

    const rawBody = await getRawBody(req);
    const body: middlewareApiComponents['schemas']['Escalate'] = JSON.parse(
      rawBody.toString(),
    );
    try {
      const agentService: AgentServices =
        this.appService.middlewareApiService.getAgentService(req);
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
      const json: middlewareApiComponents['schemas']['EscalateResponse'] = {
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
    const body: middlewareApiComponents['schemas']['Typing'] = JSON.parse(
      rawBody.toString(),
    );
    const agentService: AgentServices =
      this.appService.middlewareApiService.getAgentService(req);
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
    const body: middlewareApiComponents['schemas']['Message'] = JSON.parse(
      rawBody.toString(),
    );
    const ccpMessage = this.appService.middlewareApiService.mapToCcpMessage(
      body,
      {
        conversationId,
        messageId,
      },
    );
    const agentService: AgentServices =
      this.appService.middlewareApiService.getAgentService(req);
    await agentService.sendMessage(ccpMessage);

    return res.status(HttpStatus.NO_CONTENT).end();
  }

  @Post('/conversations/:conversationId/end')
  async conversationEnd(
    @Param('conversationId') conversationId,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const service: AgentServices =
      this.appService.middlewareApiService.getAgentService(req);
    await service.endConversation(conversationId);
    return res.status(HttpStatus.NO_CONTENT).end();
  }
}
