# Contact Center Pro
- [Technology](#technology)
- [Installation](#installation)
- [Running the app](#running-the-app)
- [Test](#test)
- docs:
    - [Add new service](/docs/add-new-service.md)
    - [Configure serviceNow instance](/docs/configure-serviceNow-instance.md)
    - [Publish SDK to NPM](/docs/publish-sdk.md)
### Technology

- **NestJS**: NestJS is a progressive Node.js framework for building efficient, reliable and scalable server-side applications. 
- **TypeScript**: TypeScript is a strongly typed programming language which builds on JavaScript.
- **NodeJS**: Node.js® is a JavaScript runtime built on Chrome's V8 JavaScript engine. `v16.6.1`
- **NPM**: NPMnpm is the package manager for Node.js. `v7`


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


# start with prod mode
$ npm run start:prod

```
## Config Services
To config end-user and agent services, update the following lines

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
