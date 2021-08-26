export type ContactCenterProApiWebhookBody = {
  requestId: string;
  clientSessionId: string;
  nowSessionId: string;
  message: Message;
  userId: string;
  body: Body[];
  agentChat: boolean;
  score: number;
};

type Body = {
  uiType: string;
  group: string;
  agentInfo: AgentInfo;
  value: string;
};

type AgentInfo = {
  sentFromAgent: boolean;
};

type Message = {
  text: string;
  typed: boolean;
  clientMessageId: string;
};
