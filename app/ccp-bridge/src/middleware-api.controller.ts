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
  middlewareApiComponents,
  middlewareApiOperations,
  MessageType,
  SendMessageResponse,
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
    const historyResponse = await this.appService.middlewareApiService.history(
      conversationId,
    );

    const messages = historyResponse.data.messages.map((item) => {
      return this.appService.serviceNowService.sendMessage({
        conversationId: conversationId,
        skill: body.skill,
        message: {
          id: '123',
          value: '123',
          type: MessageType.Text,
        },
        sender: {
          email: 'test@test.com',
          username: body.userId,
        },
      });
    });
    try {
      await Promise.all(messages);
      return {
        agentId: '123',
        escalationId: 'string',
        /** Estimated wait time in seconds */
        estimatedWaitTime: 30,
        /** The user position in the chat queue. */
        queuePosition: 1,
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
  ): Promise<boolean> {
    const res = this.appService.serviceNowService.typing();
    return res;
  }

  @Put('/conversations/:conversationId/message/:messageId')
  async message(
    @Param('conversationId') conversationId,
    @Param('messageId') messageId,
    @Body() body: middlewareApiComponents['schemas']['Message'],
  ): Promise<AxiosResponse> {
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

  // for testing, we should remove it later
  @Get('/conversations/:conversationId/message/:messageId')
  async getMessage(
    @Param('conversationId') conversationId,
    @Param('messageId') messageId,
  ): Promise<SendMessageResponse> {
    const sendMessageRes = await this.appService.serviceNowService.sendMessage({
      conversationId: conversationId,
      skill: 'english',
      message: {
        id: '123',
        value: 'test message',
        type: MessageType.Text,
      },
      sender: {
        email: 'test@test.com',
        username: 'username',
      },
    });
    return sendMessageRes.data;
  }
}
