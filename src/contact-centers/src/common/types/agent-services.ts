import { ServiceNowService } from '../../service-now/service-now.service';
import { GenesysService } from '../../genesys/genesys.service';
import { AmazonConnectService } from '../../amazon-connect/amazon-connect.service';

export type AgentServices =
  | ServiceNowService
  | GenesysService
  | AmazonConnectService;
