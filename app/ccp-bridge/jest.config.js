// eslint-disable-next-line no-undef, @typescript-eslint/no-var-requires
const jestConfig = require('@ccp/test-tools/jest.base-config');

jestConfig.setupFilesAfterEnv = ['./test/setup-env.ts'];
jestConfig.setupFiles = ['./test/set-env-vars.ts'];
// eslint-disable-next-line no-undef
module.exports = jestConfig;
