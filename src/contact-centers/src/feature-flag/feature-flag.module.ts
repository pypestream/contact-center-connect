import { Module } from '@nestjs/common';
import { FeatureFlagService } from './feature-flag.service';
import * as LaunchDarkly from 'launchdarkly-node-server-sdk';

const useFeatureFlagFactory = {
  provide: FeatureFlagService,
  useFactory: async () => {
    if (!process.env.LAUNCHDARKLY_SDK_KEY) {
      throw new Error('LaunchDarkly SDK Key is not set');
    }
    const ldClient = LaunchDarkly.init(process.env.LAUNCHDARKLY_SDK_KEY);
    await ldClient.waitForInitialization();
    return new FeatureFlagService(ldClient);
  },
};

@Module({
  imports: [],
  providers: [useFeatureFlagFactory],
  controllers: [],
  exports: [useFeatureFlagFactory],
})
export class FeatureFlagModule {}
