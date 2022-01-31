import { Module } from '@nestjs/common';
import { FreshChatController } from './fresh-chat.controller';
import { FreshChatService } from './fresh-chat.service';
import { MiddlewareApiModule } from '../middleware-api/middleware-api.module';
import { forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [forwardRef(() => MiddlewareApiModule), HttpModule],
  providers: [FreshChatService],
  controllers: [FreshChatController],
  exports: [FreshChatService],
})
export class FreshChatModule {}
