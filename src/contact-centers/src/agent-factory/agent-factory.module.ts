import { Module } from '@nestjs/common';
import { AgentFactoryService } from './agent-factory.service';
import { ServiceNowModule } from '../service-now/service-now.module';
import { GenesysModule } from '../genesys/genesys.module';
import { FlexModule } from '../flex/flex.module';
import { LivePersonModule } from '../liveperson/liveperson.module';

@Module({
  imports: [GenesysModule, ServiceNowModule, FlexModule, LivePersonModule],
  providers: [AgentFactoryService],
  controllers: [],
  exports: [AgentFactoryService],
})
export class AgentFactoryModule {}
