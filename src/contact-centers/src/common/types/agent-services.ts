import { ServiceNowService } from '../../service-now/service-now.service';
import { GenesysService } from '../../genesys/genesys.service';
import { FlexService } from '../../flex/flex.service';
import { LivePersonService } from '../../liveperson/liveperson.service';

export type AgentServices =
  | ServiceNowService
  | GenesysService
  | FlexService
  | LivePersonService;

export enum IntegrationName {
  ServiceNow = 'ServiceNow',
  Genesys = 'Genesys',
  Flex = 'Flex',
  LivePerson = 'LivePerson',
}
