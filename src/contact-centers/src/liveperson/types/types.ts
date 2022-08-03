export type LivePersonWebhookBody = {
  kind: string;
  body: {
    sentTs?: number;
    changes: [Changes];
  };
  type: string;
};

export type Changes = {
  type: string;
  conversationId?: string;
  originatorMetadata?: {
    id: string;
    role: string;
  };
  event?: {
    type: string;
    message: string;
    contentType: string;
    chatState?: string;
  };
  result: {
    convId?: string;
    effectiveTTR?: number;
    conversationDetails?: ConversationDetails;
  };
};

type Participant = {
  id: string;
  role: string;
};

type ConversationDetails = {
  participants: [Participant];
  state: string;
  startTs?: number;
  closeReason?: string;
};

/* 
{
  "kind": "notification",
  "body": {
    "sentTs": 1654764432768,
    "changes": [
      {
        "type": "UPSERT",
        "result": {
          "convId": "5c0761b0-860c-4db4-afff-e0c8b88a7b8d",
          "effectiveTTR": -1,
          "conversationDetails": {
            "skillId": "3801636938",
            "participants": [
              {
                "id": "15b9526e-0c5f-52a6-be8e-4949d2fff767",
                "role": "MANAGER"
              },
              {
                "id": "72b64f369d264215f740c2c219e8544d3795bdcafea9d86b91f0737cd8c34990",
                "role": "CONSUMER"
              },
              {
                "id": "b7b45147-6149-5a04-9dc4-f8ddcd48ef94",
                "role": "ASSIGNED_AGENT"
              }
            ],
            "dialogs": [
              {
                "dialogId": "5c0761b0-860c-4db4-afff-e0c8b88a7b8d",
                "participantsDetails": [
                  {
                    "id": "72b64f369d264215f740c2c219e8544d3795bdcafea9d86b91f0737cd8c34990",
                    "role": "CONSUMER",
                    "state": "ACTIVE"
                  },
                  {
                    "id": "b7b45147-6149-5a04-9dc4-f8ddcd48ef94",
                    "role": "ASSIGNED_AGENT",
                    "state": "ACTIVE"
                  },
                  {
                    "id": "15b9526e-0c5f-52a6-be8e-4949d2fff767",
                    "role": "MANAGER",
                    "state": "ACTIVE"
                  }
                ],
                "dialogType": "MAIN",
                "channelType": "MESSAGING",
                "metaData": {
                  "appInstallId": "a44eb05d-08ee-4b91-8dd8-4da093944b64"
                },
                "state": "OPEN",
                "creationTs": 1654764159542,
                "metaDataLastUpdateTs": 1654764159542
              }
            ],
            "brandId": "87657570",
            "state": "OPEN",
            "stage": "OPEN",
            "startTs": 1654764159542,
            "metaDataLastUpdateTs": 1654764432756,
            "ttr": {
              "ttrType": "PRIORITIZED",
              "value": 600
            },
            "conversationHandlerDetails": {
              "accountId": "87657570",
              "skillId": "3801636938"
            }
          }
        }
      }
    ]
  },
  "type": "cqm.ExConversationChangeNotification"
}
*/
