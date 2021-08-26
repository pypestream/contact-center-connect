<p align="center">
  <h3 align="center">
    nestjs-csp
  </h3>

  <p align="center">
    Injectable Csp client for your nestjs projects
  </p>

  <p align="center">
    <img src="https://circleci.com/gh/dhaspden/nestjs-csp.svg?style=svg">
    <a href="https://codecov.io/gh/dhaspden/nestjs-csp">
      <img src="https://codecov.io/gh/dhaspden/nestjs-csp/branch/master/graph/badge.svg" />
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

`nestjs-csp` implements a module, `CspModule`, which when imported into
your nestjs project provides a Csp client to any class that injects it. This
lets Csp be worked into your dependency injection workflow without having to
do any extra work outside of the initial setup.

## Installation

```bash
npm install --save nestjs-csp
```

## Getting Started

The simplest way to use `nestjs-csp` is to use `CspModule.forRoot`

```typescript
import { Module } from '@nestjs-common';
import { CspModule } from 'nestjs-csp';

@Module({
  imports: [
    CspModule.forRoot({
      apiKey: 'my_secret_key',
      apiVersion: '2020-03-02',
    }),
  ],
})
export class AppModule {}
```

You can then inject the Csp client into any of your injectables by using a
custom decorator

```typescript
import { Injectable } from '@nestjs/common';
import { InjectCsp } from 'nestjs-csp';
import Csp from 'csp';

@Injectable()
export class AppService {
  public constructor(@InjectCsp() private readonly cspClient: Csp) {}
}
```

Asynchronous setup is also supported

```typescript
import { Module } from '@nestjs-common';
import { CspModule } from 'nestjs-csp';

@Module({
  imports: [
    CspModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        apiKey: configService.get('csp_key'),
        apiVersion: '2020-03-02',
      }),
    }),
  ],
})
export class AppModule {}
```

Read up on the `csp-node` caveats
[here](https://github.com/csp/csp-node#usage-with-typescript). Due to the
way `csp-node` works you can only use the latest version of the Csp API
that was published at the time the module version was published. If you wish to
use an older version of the Csp API, follow the steps in the above link.
Because of this, the `apiVersion` field is now required along with the `apiKey`
field.

## Example

In order to run the example run the following commands in your terminal. The
expected output of the example is to show that the Csp client was
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
- [csp-node](https://github.com/csp/csp-node)

Copyright &copy; 2019 Dylan Aspden
