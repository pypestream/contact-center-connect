import { Ccp } from "../src/ccp";

describe("Test CS ServiceNow service", () => {
  it("Create ServiceNow instance if ServiceNow config is passed", () => {
    const ccp = new Ccp({
      serviceNow: {
        instanceUrl: "test_instance_url",
      },
    });
    expect(ccp.serviceNowService).toBeDefined();
    expect(ccp.serviceNowService.serviceNowConfig.instanceUrl).toEqual(
      "test_instance_url"
    );
  });

  it("ServiceNow should be null if Ccp configs not include servicenow key", () => {
    let ccp = new Ccp({});
    expect(ccp.serviceNowService).toBeNull();
    ccp = new Ccp({ serviceNow: null });
    expect(ccp.serviceNowService).toBeNull();
  });
});
