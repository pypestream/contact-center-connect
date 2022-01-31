export type FreshChatWebhookBody = {
  actor: Actor;
  action: string;
  action_time: Date;
  data: Data;
};

export type Actor = {
  actor_type: string;
  actor_id: string;
};

export type Data = {
  message: Message;
};

export type Message = {
  message_parts: MessagePart[];
  app_id: string;
  actor_id: string;
  id: string;
  channel_id: string;
  conversation_id: string;
  interaction_id: string;
  message_type: string;
  actor_type: string;
  created_time: Date;
  user_id: string;
};

export type Conversation = {
  conversation_id: string;
  app_id: string;
  channel_id: string;
  messages: Message[];
  status: 'new' | 'resolved' | 'reopened' | 'assigned';
  users: User[];
};

export type MessagePart = {
  text: Text;
};

export type Text = {
  content: string;
};

export type User = {
  id: string;
};
