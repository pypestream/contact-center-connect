import { ServiceNowService } from '../../service-now/service-now.service';
import { GenesysService } from '../../genesys/genesys.service';
import { FlexService } from '../../flex/flex.service';
import { LivePersonService } from '../../liveperson/liveperson.service';
import { AmazonConnectService } from '../../amazon-connect/amazon-connect.service';

export type AgentServices =
  | ServiceNowService
  | GenesysService
  | FlexService
  | LivePersonService
  | AmazonConnectService;

export enum IntegrationName {
  ServiceNow = 'ServiceNow',
  Genesys = 'Genesys',
  Flex = 'Flex',
  LivePerson = 'LivePerson',
  AmazonConnect = 'AmazonConnect',
}
