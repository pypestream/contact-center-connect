import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { MessageType } from '@ccp/sdk';
import { components } from '@ccp/sdk/dist/services/middleware-api/types';

@Controller('middleware-api-test')
export class MiddlewareApiTestController {
  constructor(private readonly appService: AppService) {}

  // for testing, we should remove it later
  @Get('/c/:conversationId/m/:messageId/send-message')
  async getSendMessage(
    @Param('conversationId') conversationId,
    @Param('messageId') messageId,
  ): Promise<any> {
    const sendMessageRes =
      await this.appService.middlewareApiService.sendMessage({
        conversationId: conversationId,
        skill: 'arabic',
        message: {
          id: messageId,
          value: 'new message received',
          type: MessageType.Text,
        },
        sender: {
          email: 'test9@test.com',
          username: 'username9',
        },
      });
    return sendMessageRes.data;
  }
}
