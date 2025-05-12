# packageName

## Project structure

- `src/main.tact` – source code of contract
- `src/main.spec.ts` – test suite
- `deploy.ts` – script for deploying the contract
- `tact.config.json` – compiler settings

## How to use

- `pmRun build` – build contracts and the `.ts` wrappers
- `pmRun test` – build contracts and run jest tests
- `pmRun fmt` – fix source code formatting
- `pmRun lint` – run semantic checks with `misti` linter
- `pmRun verifier:testnet` – deploy contract to testnet
- `pmRun verifier:mainnet` – deploy contract to mainnet
- `pmRun fmt:check` – check source code formatting (for CI)

## Available CLIs

- `tact` – Tact compiler
- `tact-fmt` – Tact formatter
- `unboc` – Disassembler
- `@nowarp/misti` – Misti static analyzer
- `jest` – Jest testing framework

Use `npx` to run any of the CLIs available. For example, to invoke the Tact formatter, execute this:

```shell
npx tact-fmt
```
