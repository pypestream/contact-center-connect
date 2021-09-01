import {
  Service,
  CcpMessage,
  SendMessageResponse,
  ServiceNowConfig,
  MessageType,
  ContactCenterProConfig,
} from "../common/interfaces";
import axis from "axios";
import { v4 as uuidv4 } from "uuid";
import { ServiceNowWebhookBody } from "./types";

export class ServiceNowService implements Service<ServiceNowWebhookBody> {
  serviceNowConfig: ServiceNowConfig;
  contactCenterProConfig: ContactCenterProConfig;

  constructor(ccpConfig: ContactCenterProConfig, config: ServiceNowConfig) {
    this.serviceNowConfig = ccpConfig;
    this.contactCenterProConfig = config;
  }

  private sendMessageRequestBody(message: CcpMessage) {
    const requestId = uuidv4();
    return {
      requestId,
      action: "AGENT",
      // Currently unused.
      enterpriseId: "ServiceNow",
      // Currently unused.
      nowBotId: "",
      clientSessionId: message.conversationId,
      // Currently unused.
      nowSessionId: "",
      contextVariables: {
        LiveAgent_mandatory_skills: "english",
      },
      message: {
        text: message.message.value,
        typed: true,
        clientMessageId: message.message.id,
      },
      userId: message.sender.username,
      emailId: message.sender.email,
      timestamp: "1588824102",
      timezone: "America/New_York",
    };
  }

  async sendMessage(message: CcpMessage): Promise<SendMessageResponse> {
    try {
      const res = await axis.post(
        this.serviceNowConfig.instanceUrl + "/api/sn_va_as_service/bot/integration",
        this.sendMessageRequestBody(message)
      );
      return {
        message: res.data.status,
        status: res.status,
      };
    } catch (ex) {
      return {
        message: ex.message,
        status: 400,
      };
    }
  }

  isMessageSentByAgent(body: ServiceNowWebhookBody): boolean {
    return body.body[0].agentInfo.sentFromAgent;
  }

  mapToCcpMessage(body: ServiceNowWebhookBody): CcpMessage {
    return {
      message: {
        value: body.body[0].value,
        type:
          body.body[0].uiType === "OutputText"
            ? MessageType.Text
            : MessageType.Image,
      },
      sender: {
        username: body.body[0].group,
      },
      conversationId: body.clientSessionId,
    };
  }

  isChatEnded(message: ServiceNowWebhookBody): boolean {
    return message.completed;
  }

  isAvailable(): boolean {
    return true;
  }

  waitTime(): boolean {
    return true;
  }
}
