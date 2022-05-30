export type ServiceNowWebhookBody = {
  requestId: string;
  clientSessionId: string;
  nowSessionId: string;
  message: Message;
  userId: string;
  body: Array<ServiceNowWebhookBodyItem>;
  agentChat: boolean;
  completed: boolean;
  score: number;
  clientVariables?: any;
};

export type ServiceNowWebhookBodyItem =
  | StartTypingIndicatorType
  | EndTypingIndicatorType
  | StartProcessingSpinnerType
  | ActionSystemType
  | OutputTextType
  | EndWaitTimeSpinnerType
  | StartWaitTimeSpinnerType
  | EndProcessingSpinnerType
  | TopicPickerControlType
  | SwitchToLiveAgentType;

export type EndTypingIndicatorType = {
  uiType: 'ActionMsg';
  actionType: 'EndTypingIndicator';
};

export type StartTypingIndicatorType = {
  uiType: 'ActionMsg';
  actionType: 'StartTypingIndicator';
};

export type ActionSystemType = {
  uiType: 'ActionMsg';
  actionType: 'System';
  message: string;
};

export type OutputTextType = {
  uiType: 'OutputText';
  actionType: 'DefaultText';
  group: 'DefaultText';
  agentInfo: AgentInfo;
  value: string;
  maskType: string;
};

type EndWaitTimeSpinnerType = {
  uiType: 'ActionMsg';
  actionType: 'EndSpinner';
  spinnerType: 'wait_time';
};

export type StartWaitTimeSpinnerType = {
  uiType: 'ActionMsg';
  actionType: 'StartSpinner';
  spinnerType: 'wait_time';
  message: string;
  waitTime: string;
};

type StartProcessingSpinnerType = {
  uiType: 'ActionMsg';
  actionType: 'StartSpinner';
  spinnerType: 'processing';
};

type EndProcessingSpinnerType = {
  uiType: 'ActionMsg';
  actionType: 'EndSpinner';
  spinnerType: 'processing';
};

type SwitchToLiveAgentType = {
  uiType: 'ActionMsg';
  actionType: 'SwitchToLiveAgent';
};

type TopicPickerControlType = {
  uiType: 'TopicPickerControl';
  group: 'DefaultPicker';
};

type AgentInfo = {
  sentFromAgent: boolean;
  agentName: string;
  agentAvatar: string;
};

export type Message = {
  text: string;
  typed: boolean;
  clientMessageId: string;
};
