# Tact Quick Start

Tact is a fresh programming language for TON Blockchain, focused on efficiency and ease of development. It is a good fit for complex smart contracts, quick onboarding and rapid prototyping.

This quick start guide will help you [set up your editor or IDE](#editor-setup), understand some of the basics of Tact and TON, and learn from the given Tact smart contracts: a counter and an open-ended poll.

We'll also cover how to create, test, and deploy contracts using the provided template, which includes a complete development environment with all the necessary tools pre-configured.

## Editor setup

- [VS Code extension](https://marketplace.visualstudio.com/items?itemName=tonstudio.vscode-tact) - Powerful and feature-rich extension for Visual Studio Code (VSCode) and VSCode-based editors like VSCodium, Cursor, Windsurf, and others.
  - Get it on the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=tonstudio.vscode-tact).
  - Get it on the [Open VSX Registry](https://open-vsx.org/extension/tonstudio/vscode-tact).
  - Or install from the [`.vsix` files in nightly releases](https://github.com/tact-lang/tact-language-server/releases).
- [Language Server (LSP Server)](https://github.com/tact-lang/tact-language-server) - Supports Sublime Text, (Neo)Vim, Helix, and other editors with LSP support.
- [Intelli Tact](https://plugins.jetbrains.com/plugin/27290-tact) - Powerful and feature-rich plugin for JetBrains IDEs like WebStorm, IntelliJ IDEA, and others.
- [tact.vim](https://github.com/tact-lang/tact.vim) - Vim 8+ plugin.
- [tact-sublime](https://github.com/tact-lang/tact-sublime) - Sublime Text 4 package.
  - Get it on the [Package Control](https://packagecontrol.io/packages/Tact).
- [tree-sitter-tact](https://github.com/tact-lang/tree-sitter-tact) - Tree-sitter grammar for Tact.

The language server, VSCode extension, and JetBrains plugin linked above come with hover documentation for built-in keywords, which is very helpful for discovering the language on your own!

If you're done with the setup, let's discuss the contents of this project.

## Project structure

Start exploring this project with a Counter contract. Once ready, move to the Poll or to any of the auxiliary files.

- `src/counter.tact` — source code of the Counter contract
- `src/counter.spec.ts` — test suite for it
- `src/poll.tact` — source code of the Open-ended Poll contract
- `src/poll.spec.ts` — test suite for it
- `deploy.ts` – script for deploying the contracts
- `tact.config.json` – compiler settings

To add new contract files to the project, do:

1. Create a new `src/my-new-contract.tact`
2. Copy an existing test suite into the one for the new contract in `src/my-new-contract.spec.ts`, then adjust the contents to match the new contract
3. If the contract is used directly and not deployed by other ones, then:
  * Modify `deploy.ts`
  * Modify `tact.config.json`

To build, test or deploy contracts see the following commands.

## Commands

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
