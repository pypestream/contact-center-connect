import { CspConfig } from './services/common/interfaces';
import {ServiceNowService} from './services/service-now/service'

export class Csp {

  private readonly _serviceNowService: InstanceType<typeof ServiceNowService> = null;

  constructor(config: CspConfig) {
    if(config.serviceNow){
      this._serviceNowService = new ServiceNowService(config.serviceNow);
    }
  }

  get serviceNowService() {
    return this._serviceNowService;
  }

}