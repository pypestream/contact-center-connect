import { ServiceNowService } from '../../service-now/service-now.service';
import { GenesysService } from '../../genesys/genesys.service';
import { FlexService } from '../../flex/flex.service';

export type AgentServices = ServiceNowService | GenesysService | FlexService;

export enum IntegrationName {
  ServiceNow = 'ServiceNow',
  Genesys = 'Genesys',
  Flex = 'Flex',
}
