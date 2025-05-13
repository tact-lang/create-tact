# packageName

## Project structure

- `src/main.tact` – source code of contract
- `src/main.spec.ts` – test suite
- `deploy.ts` – script for deploying the contract
- `tact.config.json` – compiler settings

## How to use

- `pmRun build` – build `.ts` API for contract
- `pmRun test` – build contracts and run jest tests
- `pmRun fmt` – fix source code formatting
- `pmRun lint` – run semantic checks with `misti` linter
- `pmRun verifier:testnet` – deploy contract to testnet
- `pmRun verifier:mainnet` – deploy contract to mainnet
- `pmRun fmt:check` – check source code formatting (for CI)
