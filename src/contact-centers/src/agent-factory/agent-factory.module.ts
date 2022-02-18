import { Module } from '@nestjs/common';
import { AgentFactoryService } from './agent-factory.service';
import { ServiceNowModule } from '../service-now/service-now.module';
import { GenesysModule } from '../genesys/genesys.module';
import { AmazonConnectModule } from '../amazon-connect/amazon-connect.module';

@Module({
  imports: [GenesysModule, ServiceNowModule, AmazonConnectModule],
  providers: [AgentFactoryService],
  controllers: [],
  exports: [AgentFactoryService],
})
export class AgentFactoryModule {}
