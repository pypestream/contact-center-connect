import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CspModule } from '@csp/nestjs-module';
import { ServiceNowService } from '@csp/sdk/dist/services/service-now/service';

const serviceNowConfig = {
  instanceUrl: 'https://dev78406.service-now.com',
  apiKey: '123',
};
describe('AppController', () => {
  let appController: AppController;
  let spyAppService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      imports: [
        CspModule.forRoot({
          serviceNow: serviceNowConfig,
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
      const result = new ServiceNowService(serviceNowConfig);
      const spy = jest.spyOn(spyAppService, 'serviceNowService', 'get').mockImplementationOnce(() => result);
      appController.sendToAgent();
      expect(spy).toHaveBeenCalled();
    });
  });
});
