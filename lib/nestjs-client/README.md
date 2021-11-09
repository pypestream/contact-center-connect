<p align="center">
  <h3 align="center">
    nestjs-client
  </h3>

  <p align="center">
    Injectable Ccc client for your nestjs projects
  </p>

  <p align="center">
    <img src="https://circleci.com/gh/dhaspden/nestjs-client.svg?style=svg">
    <a href="https://codecov.io/gh/dhaspden/nestjs-client">
      <img src="https://codecov.io/gh/dhaspden/nestjs-client/branch/master/graph/badge.svg" />
    </a>
  </p>
</p>

## Table Of Contents

- [Table Of Contents](#table-of-contents)
- [About](#about)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Example](#example)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

## About

`nestjs-client` implements a module, `CccModule`, which when imported into
your nestjs project provides a Ccc client to any class that injects it. This
lets Ccc be worked into your dependency injection workflow without having to
do any extra work outside of the initial setup.

## Installation

```bash
npm install --save nestjs-client
```

## Getting Started

The simplest way to use `nestjs-client` is to use `CccModule.forRoot`

```typescript
import { Module } from '@nestjs-common';
import { CccModule } from 'nestjs-client';

@Module({
  imports: [
    CccModule.forRoot({
      apiKey: 'my_secret_key',
      apiVersion: '2020-03-02',
    }),
  ],
})
export class AppModule {}
```

You can then inject the Ccc client into any of your injectables by using a
custom decorator

```typescript
import { Injectable } from '@nestjs/common';
import { InjectCcc } from 'nestjs-client';
import Ccc from 'ccc';

@Injectable()
export class AppService {
  public constructor(@InjectCcc() private readonly cccClient: Ccc) {}
}
```

Asynchronous setup is also supported

```typescript
import { Module } from '@nestjs-common';
import { CccModule } from 'nestjs-client';

@Module({
  imports: [
    CccModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        apiKey: configService.get('ccc_key'),
        apiVersion: '2020-03-02',
      }),
    }),
  ],
})
export class AppModule {}
```

Read up on the `ccc-node` caveats
[here](https://github.com/ccc/ccc-node#usage-with-typescript). Due to the
way `ccc-node` works you can only use the latest version of the Ccc API
that was published at the time the module version was published. If you wish to
use an older version of the Ccc API, follow the steps in the above link.
Because of this, the `apiVersion` field is now required along with the `apiKey`
field.

## Example

In order to run the example run the following commands in your terminal. The
expected output of the example is to show that the Ccc client was
successfully injected into the `AppService`.

```bash
cd example
yarn install
yarn start
```

## Contributing

I would greatly appreciate any contributions to make this project better. Please
make sure to follow the below guidelines before getting your hands dirty.

1. Fork the repository
2. Create your branch (`git checkout -b my-branch`)
3. Commit any changes to your branch
4. Push your changes to your remote branch
5. Open a pull request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Acknowledgements

- [nestjs](https://nestjs.com)
- [ccc-node](https://github.com/ccc/ccc-node)

Copyright &copy; 2019 Dylan Aspden
