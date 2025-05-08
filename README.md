# create-tact

Creates a Tact project from a template

## Prerequisites

- node.js
- npm
- git

## How to use

Use `create` of your favorite package manager to run:

```shell
npm create tact@latest
```

or

```shell
yarn create tact@latest
```

## CLI flags

You can use the following flags when running the generator:

| Flag                                     | Description                                             | Example usage                     | Default                   |
|------------------------------------------|---------------------------------------------------------|-----------------------------------|---------------------------|
| `--contractName=<Name>`                  | Contract name (PascalCase, must not be a reserved word) | `--contractName=MyToken`          | Will prompt interactively |
| `--skipDepsInstallation=<true/false>`    | Skip dependency installation and project build          | `--skipDepsInstallation=true`     | false                     |
| `--initializeGitRepository=<true/false>` | Initialize git repository in the project                | `--initializeGitRepository=false` | true                      |

**Important:**
For all boolean flags (`true`/`false`), you must specify the value explicitly, e.g.:
- `--skipDepsInstallation=false`
- `--initializeGitRepository=true`
