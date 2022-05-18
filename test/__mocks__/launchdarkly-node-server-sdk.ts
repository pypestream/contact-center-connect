const launchdarklyNodeServerSdk: any = jest.createMockFromModule(
  'launchdarkly-node-server-sdk',
);
let mockFlags = Object.create({});

function __mockFlags(flags) {
  mockFlags = flags;
}

function init(key: string) {
  return {
    waitForInitialization: () => Promise.resolve(),
    __mockFlags: __mockFlags,
    variation: (flag: any) =>
      new Promise((resolve) =>
        resolve(mockFlags[flag] ? mockFlags[flag] : false),
      ),
  };
}

launchdarklyNodeServerSdk.init = init;
launchdarklyNodeServerSdk.__mockFlags = __mockFlags;

module.exports = launchdarklyNodeServerSdk;
