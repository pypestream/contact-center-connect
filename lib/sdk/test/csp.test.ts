import { Csp } from '../src/csp';

describe('Test CS ServiceNow service', () => {
  it('Create ServiceNow instance if ServiceNow config is passed', () => {
    const csp = new Csp({serviceNow:{
      instanceUrl:'test_instance_url',
        apiKey:'test'
      }})
    expect(csp.serviceNowService).toBeDefined();
    expect(csp.serviceNowService.instanceUrl).toEqual('test_instance_url');
  });

  it('ServiceNow should be null if Csp configs not include servicenow key', () => {
    let csp = new Csp({})
    expect(csp.serviceNowService).toBeNull();
    csp = new Csp({serviceNow:null});
    expect(csp.serviceNowService).toBeNull();
  });
});
