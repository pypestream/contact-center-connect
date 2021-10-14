import { Test, TestingModule } from '@nestjs/testing';
import { AgentController } from './agent.controller';
import { CcpModule } from '@ccp/nestjs-module';
import { AppService } from './app.service';
import { MiddlewareApiConfig, ServiceNowConfig, MessageType } from '@ccp/sdk';

const middlewareApiConfig: MiddlewareApiConfig = {
  instanceUrl: 'https://mock-server.middleware.com',
  token: 'ydeHKGvMxhpMOeUqvgFG//jdsauXvpFqySTa740KsBdWMSc+3iNBdNRjGLHJ6frY',
};

const serviceNowConfig: ServiceNowConfig = {
  instanceUrl: 'https://mock-server.service-now.com',
};

describe('AppService', () => {
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AgentController],
      imports: [
        CcpModule.forRoot({
          middlewareApi: middlewareApiConfig,
          serviceNow: serviceNowConfig,
        }),
      ],
      providers: [
        AppService,
        {
          provide: AppService,
          useValue: {
            middlewareApiService: {
              sendMessage: jest.fn(),
            },
            serviceNowService: {
              hasNewMessageAction: jest.fn(),
              hasEndConversationAction: jest.fn(),
              hasTypingIndicatorAction: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    appService = app.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(appService).toBeDefined();
  });
  it('should give the expected return', async () => {
    appService.middlewareApiService.sendMessage = jest
      .fn()
      .mockReturnValue({ data: 'your object here' });
    const poolJobs = await appService.middlewareApiService.sendMessage({
      message: {
        id: 'abc-123',
        value: 'message',
        type: MessageType.Text,
      },
      sender: {
        username: 'abc-123',
        email: 'a@b.com',
      },
      conversationId: 'abc-123',
      skill: 'foo-skill',
    });
    expect(poolJobs).toEqual({ data: 'your object here' });
  });
});
