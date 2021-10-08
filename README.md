# Contact Center Pro
- [Technology](#technology)
- [Installation](#installation)
- [Running the app](#running-the-app)
- [Test](#test)
- docs:
    - [Add new service](/docs/add-new-service.md)
    - [Configure serviceNow instance](/docs/configure-serviceNow-instance.md)
### Technology

- **NestJS**: A progressive Node.js framework for building efficient, reliable and scalable server-side applications. 
- **TypeScript**: TypeScript is JavaScript with syntax for types.
- **NodeJS**: Node.js® is a JavaScript runtime built on Chrome's V8 JavaScript engine. `v16.6.1`
- **NPM**: Node package manager `v7`


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

```ts
    // app/ccsp-bridge/src/app.module.js
    CcpModule.forRoot({
      ccp: {
        instanceUrl: 'https://enhvq0q28akbhlm.m.pipedream.net',
      },
      serviceNowCuso: {
        instanceUrl: 'https://dev50996.service-now.com',
      },
      middlewareApi: {
        instanceUrl: 'https://middleware.claybox.usa.pype.engineering',
        token:
          'ydeHKGvMxhpMOeUqvgFG//jdsauXvpFqySTa740KsBdWMSc+3iNBdNRjGLHJ6frY',
      },
    }),
````

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
