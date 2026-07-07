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

## Learn more about Tact

- [Website](https://tact-lang.org/)
- [Documentation](https://docs.tact-lang.org/)
    - [Learn Tact in Y minutes](https://docs.tact-lang.org/book/learn-tact-in-y-minutes/)
    - [Debugging and testing Tact contracts](https://docs.tact-lang.org/book/debug/)
    - [Gas best practices](https://docs.tact-lang.org/book/gas-best-practices/)
    - [Security best practices](https://docs.tact-lang.org/book/security-best-practices/)
- [Awesome Tact](https://github.com/tact-lang/awesome-tact)

For more interesting contract examples, see the [Tact's DeFi Cookbook](https://github.com/tact-lang/defi-cookbook).

## Community

If you can’t find the answer in the [docs](https://docs.tact-lang.org), or you’ve tried to do some local testing and it still didn’t help — don’t hesitate to reach out to Tact’s flourishing community:

- [`@tactlang` on Telegram](https://t.me/tactlang) - Main community chat and discussion group.
- [`@tactlang_ru` on Telegram](https://t.me/tactlang_ru) _(Russian)_
- [`@tact_kitchen` on Telegram](https://t.me/tact_kitchen) - Channel with updates from the team.
- [`@tact_language` on X/Twitter](https://x.com/tact_language)
- [`tact-lang` organization on GitHub](https://github.com/tact-lang)
- [`@ton_studio` on Telegram](https://t.me/ton_studio)
- [`@thetonstudio` on X/Twitter](https://x.com/thetonstudio)

Good luck on your coding adventure with ⚡ Tact!
