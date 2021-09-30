import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { AppService } from './app.service';
import {
  MessageType,
  middlewareApiComponents,
  middlewareApiOperations,
} from '@ccp/sdk';
import { AxiosResponse } from 'axios';

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
  ): Promise<middlewareApiComponents['schemas']['AgentAvailability']> {
    const isAvailable = this.appService.serviceNowService.isAvailable(
      query.skill,
    );
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
    @Body() body: middlewareApiComponents['schemas']['Escalate'],
  ): Promise<middlewareApiComponents['schemas']['EscalateResponse']> {
    // TODO: history middleware api is not implemented
    // const historyResponse = await this.appService.middlewareApiService
    //   .history(conversationId)
    //   .catch(err => {
    //     return err.response;
    //   });

    try {
      await this.appService.serviceNowService.startConversation({
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
      return {
        agentId: '',
        escalationId: '',
        /** Estimated wait time in seconds */
        estimatedWaitTime: 0,
        /** The user position in the chat queue. */
        queuePosition: 0,
        /** (accepted, queued) */
        status: 'queued',
      };
    } catch (ex) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: ex.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('/conversations/:conversationId/type')
  async type(
    @Param('conversationId') conversationId,
    @Body() body: middlewareApiComponents['schemas']['Typing'],
  ): Promise<string> {
    const res = await this.appService.serviceNowService.sendTyping(
      conversationId,
      body.typing,
    );
    return res.data.message;
  }

  @Put('/conversations/:conversationId/message/:messageId')
  async message(
    @Param('conversationId') conversationId,
    @Param('messageId') messageId,
    @Body() body: middlewareApiComponents['schemas']['Message'],
  ): Promise<AxiosResponse> {
    this.appService.middlewareApiService.mapToCcpMessage(
      body,
      conversationId,
      messageId,
    );
    const sendMessageRes = await this.appService.serviceNowService.sendMessage({
      conversationId: conversationId,
      skill: 'english',
      message: {
        id: messageId,
        value: body.content,
        type: MessageType.Text,
      },
      sender: {
        email: 'test@test.com',
        username: body.senderId,
      },
    });

    return sendMessageRes;
  }

  @Post('/conversations/:conversationId/end')
  async conversationEnd(
    @Param('conversationId') conversationId,
    @Body() body: middlewareApiComponents['schemas']['End'],
  ): Promise<AxiosResponse> {
    const sendMessageRes =
      await this.appService.serviceNowService.endConversation(conversationId);

    return sendMessageRes;
  }
}
