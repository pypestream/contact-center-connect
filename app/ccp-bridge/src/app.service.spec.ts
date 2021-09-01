import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { CcpModule } from '@ccp/nestjs-module';
import { AppService } from './app.service';

const serviceNowConfig = {
  instanceUrl: 'https://dev78406.service-now.com'
};

describe('AppService', () => {
  let appController: AppController;
  let spyAppService: AppService;
  let appService = {
    serviceNowService: {
      sendMessage: () => ({ status: 'success' }),
    },
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      imports: [
        CcpModule.forRoot({
          serviceNow: serviceNowConfig,
        }),
      ],
      providers: [AppService],
    })
      .overrideProvider(AppService)
      .useValue(appService)
      .compile();

    appController = app.get<AppController>(AppController);
    spyAppService = app.get<AppService>(AppService);
  });

  describe('Send Message to Agent', () => {

    it('Should send message to servicenow',async () => {
      const res = await appController.sendToAgent();
      expect(res.status).toEqual('success')
    });
  });
});
