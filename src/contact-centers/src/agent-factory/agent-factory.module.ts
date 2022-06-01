import { Module } from '@nestjs/common';
import { AgentFactoryService } from './agent-factory.service';
import { ServiceNowModule } from '../service-now/service-now.module';
import { GenesysModule } from '../genesys/genesys.module';
import { FlexModule } from '../flex/flex.module';
import { AmazonConnectService } from '../amazon-connect/amazon-connect.service';

@Module({
  imports: [GenesysModule, ServiceNowModule, FlexModule, AmazonConnectService],
  providers: [AgentFactoryService],
  controllers: [],
  exports: [AgentFactoryService],
})
export class AgentFactoryModule {}
