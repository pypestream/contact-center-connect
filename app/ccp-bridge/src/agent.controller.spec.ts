import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CcpModule } from '@ccp/nestjs-module';
import { ServiceNowService } from '@ccp/sdk';

const serviceNowConfig = {
  instanceUrl: 'https://dev78406.service-now.com',
};

const ccpConfig = {
  instanceUrl: 'https://localhost:3000',
};

describe('AppController', () => {
  let appController: AppController;
  let spyAppService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      imports: [
        CcpModule.forRoot({
          serviceNow: serviceNowConfig,
          ccp: ccpConfig,
        }),
      ],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    spyAppService = app.get<AppService>(AppService);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });

    it('ApiService - should be defined', () => {
      expect(spyAppService).toBeDefined();
      expect(spyAppService.serviceNowService).toBeDefined();
    });
  });

  describe('Send Message to Agent', () => {
    it('should call send message to agent', async () => {
      const result = new ServiceNowService(ccpConfig, serviceNowConfig);
      const spy = jest
        .spyOn(spyAppService, 'serviceNowService', 'get')
        .mockImplementationOnce(() => result);
      await appController.sendToAgent();
      expect(spy).toHaveBeenCalled();
    });
  });
});
