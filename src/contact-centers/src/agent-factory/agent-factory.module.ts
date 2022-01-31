import { Module } from '@nestjs/common';
import { AgentFactoryService } from './agent-factory.service';
import { ServiceNowModule } from '../service-now/service-now.module';
import { GenesysModule } from '../genesys/genesys.module';
import { FreshChatModule } from '../fresh-chat/fresh-chat.module';

@Module({
  imports: [GenesysModule, ServiceNowModule, FreshChatModule],
  providers: [AgentFactoryService],
  controllers: [],
  exports: [AgentFactoryService],
})
export class AgentFactoryModule {}
