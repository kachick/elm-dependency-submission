# How to develop

## Setup

1. Install [Nix](https://nixos.org/) package manager
2. Run `nix-shell`
3. You can use development tasks

```console
> nix-shell
(prepared bash)

> npm install
64 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities..

> makers help
Tools
----------
check - ...
help - ...

> makers check
...tests, typechecks, linters...
```

See also [scripts](package.json) for tasks details.

## REPL

```typescript
> npm run repl

> my-new-action@1.0.0 repl
> tsx

Welcome to Node.js v20.8.0.
Type ".help" for more information.

>
> const { info, isDebug, debug } = await import('@actions/core');
undefined
> isDebug()
false

> // Utils can be loaded
> const { parsePackage } = await import('./src/elm-package-detector.ts');
> parsePackage('elm-explorations/test', '2.1.0')
PackageURL {
  type: 'elm',
  name: 'test',
  namespace: 'elm-explorations',
  version: '2.1.0',
  qualifiers: null,
  subpath: null
}
```
