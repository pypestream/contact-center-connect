import { Test, TestingModule } from '@nestjs/testing';
import { AgentController } from './agent.controller';
import { CcpModule } from '@ccp/nestjs-module';
import { AppService } from './app.service';
import { MiddlewareApiConfig } from '@ccp/sdk';

const middlewareApiConfig: MiddlewareApiConfig = {
  instanceUrl: 'https://middleware.claybox.usa.pype.engineering',
  token: 'ydeHKGvMxhpMOeUqvgFG//jdsauXvpFqySTa740KsBdWMSc+3iNBdNRjGLHJ6frY',
};

describe('AppService', () => {
  let agentController: AgentController;
  let spyAppService: AppService;
  let appService = {
    middlewareApiService: {
      sendMessage: async () => ({
        status: 'success',
        data: {
          content: 'fake message',
        },
      }),
    },
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AgentController],
      imports: [
        CcpModule.forRoot({
          middlewareApi: middlewareApiConfig,
        }),
      ],
      providers: [AppService],
    })
      .overrideProvider(AppService)
      .useValue(appService)
      .compile();

    agentController = app.get<AgentController>(AgentController);
    spyAppService = app.get<AppService>(AppService);
  });

  describe('Send Message to Agent', () => {
    it('Should send message to servicenow', async () => {
      const res = await agentController.message();
      expect(res.status).toEqual('success');
    });
  });
});
