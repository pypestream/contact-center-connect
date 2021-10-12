import { Ccp } from "../src/ccp";
import { MessageType } from "../src";

describe("Test CS ServiceNow service", () => {
  it("Create ServiceNow instance if ServiceNow config is passed", async () => {
    const ccp = new Ccp({
      serviceNow: {
        instanceUrl: "https://dev50996.service-now.com",
      },
    });

    expect(ccp.serviceNowService).toBeDefined();
    expect(ccp.serviceNowService.serviceNowConfig.instanceUrl).toEqual(
      "https://dev50996.service-now.com"
    );
    expect(ccp.middlewareApiService).toBeNull();
  });

  it("ServiceNow should be null if Ccp configs not include servicenow key", () => {
    let ccp = new Ccp({});
    expect(ccp.serviceNowService).toBeNull();
    ccp = new Ccp({ serviceNow: null });
    expect(ccp.serviceNowService).toBeNull();
  });

  it("Start ServiceNow conversation", async () => {
    const ccp = new Ccp({
      serviceNow: {
        instanceUrl: "https://dev50996.service-now.com",
      },
    });
    const res = await ccp.serviceNowService.startConversation({
      conversationId: "abc-123",
      message: {
        id: "abc-123",
        type: MessageType.Text,
        value: "test message",
      },
      sender: {
        email: "test@email.com",
        username: "test-user",
      },
      skill: "foo",
    });

    expect(res.data.status).toEqual("success");
  });

  it("Send message ServiceNow agent", async () => {
    const ccp = new Ccp({
      serviceNow: {
        instanceUrl: "https://dev50996.service-now.com",
      },
    });
    const res = await ccp.serviceNowService.sendMessage({
      conversationId: "abc-123",
      message: {
        id: "abc-123",
        type: MessageType.Text,
        value: "test message",
      },
      sender: {
        email: "test@email.com",
        username: "test-user",
      },
      skill: "foo",
    });

    expect(res.data.status).toEqual("success");
  });

  it("End ServiceNow conversation", async () => {
    const ccp = new Ccp({
      serviceNow: {
        instanceUrl: "https://dev50996.service-now.com",
      },
    });
    const res = await ccp.serviceNowService.endConversation("abc-123");

    expect(res.data.status).toEqual("success");
  });
});
