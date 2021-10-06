

## Installation

```bash
$ npm install
$ npm build
```
```
./ngrok http 3000
$ npm build
```

## Running the app

```bash
# bind ngrok to port
./ngrok http 3000

# start with watch mode
$ npm run start:dev

```
## Config Services
To config end-user and agent services

app/ccsp-bridge/src/app.module.js
```ts
    CcpModule.forRoot({
      ccp: {
        instanceUrl: 'https://enhvq0q28akbhlm.m.pipedream.net',
      },
      serviceNow: {
        instanceUrl: 'https://dev50996.service-now.com',
      },
      middlewareApi: {
        instanceUrl: 'https://middleware.claybox.usa.pype.engineering',
        token:
          'ydeHKGvMxhpMOeUqvgFG//jdsauXvpFqySTa740KsBdWMSc+3iNBdNRjGLHJ6frY',
      },
    }),
````
## Service Configuration
  - [ServiceNow Configration](/docs/config-servicenow.md)
## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
