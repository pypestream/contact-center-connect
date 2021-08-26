import {
  Service,
  SendMessageResponse,
  ServiceEnum,
  CspMessage,
} from "../common/interfaces";
import axis from "axios";
import { v4 as uuidv4 } from "uuid";
import { ContactCenterProApiWebhookBody } from "./types";

export class ContactCenterProService
  implements Service<ContactCenterProApiWebhookBody>
{
  instanceUrl: string;

  static serviceName = ServiceEnum.ServiceNow;

  sendMessageRequestBody(message: CspMessage) {
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
  sendMessage(message: CspMessage): Promise<SendMessageResponse> {
    axis.post(
      this.instanceUrl + "/api/sn_va_as_service/bot/integration",
      this.sendMessageRequestBody(message)
    );
    return Promise.resolve(undefined);
  }

  mapToCspMessage(body: ContactCenterProApiWebhookBody): CspMessage {
    return {
      message: {
        value: body.body[0].value,
      },
      sender: {
        username: body.body[0].group,
      },
      conversationId: body.clientSessionId,
    };
  }
  isMessageSentByAgent(message: ContactCenterProApiWebhookBody): boolean {
    return message.body[0].agentInfo.sentFromAgent;
  }

  isChatEnded(message: ContactCenterProApiWebhookBody): boolean {
    return message.completed;
  }
}
