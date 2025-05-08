import { mkdir, readdir, readFile, stat, writeFile } from "fs/promises";
import { dirname, join, relative, basename } from "path";
import { createInterface, Interface } from "readline/promises";
import { stdin, stdout } from 'process';
import { exec } from "child_process";
import { promisify } from "util";

export interface ParsedCLI<T extends Record<string, string>> {
    flags: T;
    args: string[];
}

export const parseCLI = <T extends Record<string, string>>(argv: string[]): ParsedCLI<T> => {
    const flags: Record<string, string> = {};
    const args: string[] = [];
    for (let i = 0; i < argv.length; i++) {
        const token = argv.at(i) ?? "";
        if (token.startsWith('--')) {
            const eq = token.indexOf('=');
            if (eq !== -1) {
                flags[token.slice(2, eq)] = token.slice(eq + 1);
            } else {
                flags[token.slice(2)] = argv[++i] ?? '';
            }
        } else {
            args.push(token);
        }
    }
    return { flags: flags as T, args: args[0] === "create" ? args.slice(1) : args };
};

export type CliParams = {
    contractName?: string;
    skipDepsInstallation?: string;
    initializeGitRepository?: string;
};

async function getFilesAux(dir: string, files: string[]): Promise<void> {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
            await getFilesAux(fullPath, files);
        } else {
            files.push(fullPath);
        }
    }
}

async function getFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    await getFilesAux(dir, files);
    return files;
}

function kebabToPascal(input: string): string {
    return ('-' + input).replace(/-(\w)/g, (_, c) => c.toUpperCase());
}

async function reprompt<T>(cb: () => Promise<T | undefined>): Promise<T> {
    for (; ;) {
        const result = await cb();
        if (typeof result !== 'undefined') {
            return result;
        }
    }
}

export const runCommand = (command: string, cwd: string = process.cwd()) => {
    const env = { ...process.env, FORCE_COLOR: process.stdout.isTTY ? '1' : '0' };
    const thread = exec(command, { cwd, env });
    return new Promise<boolean>((resolve, reject) => {
        thread.stdout?.pipe(process.stdout);
        thread.stderr?.pipe(process.stderr);
        thread.on("error", (code) => {
            reject(code);
        });
        thread.on("exit", (code, signal) => {
            if (code !== null) {
                const result = code === 0;
                if (!result) {
                    console.error(`Child process exited with non-zero code: ${code}`);
                }
                resolve(result);
            } else if (signal !== null) {
                console.error(`Child process signaled ${signal}`);
                resolve(false);
            } else {
                reject(new Error("Node.js bug"));
            }
        });
    });
};

async function folderExists(path: string): Promise<boolean> {
    try {
        await stat(path);
        return true;
    } catch (err: any) {
        if (err.code === 'ENOENT') {
            return false;
        }
        throw err;
    }
}

async function isNonEmptyFolder(path: string): Promise<boolean> {
    const files = await readdir(path);
    if (files.length === 0) return false;
    // JetBrains IDEs create a hidden folder `.idea` when generating a project
    if (files.length === 1 && (files[0] === ".idea" || files[0] === ".vscode")) return false;
    return files.length !== 0;
}

const execAsync = promisify(exec);

export async function isGitInstalled(): Promise<boolean> {
    try {
        await execAsync('git --version');
        return true;
    } catch {
        return false;
    }
}

function detectPackageManager() {
    const pkgManager = process.env.npm_config_user_agent?.split(' ')[0]?.split('/')[0] ?? 'npm';

    switch (pkgManager) {
        case 'yarn': return { name: 'yarn', install: 'yarn', run: 'yarn' } as const;
        case 'pnpm': return { name: 'pnpm', install: 'pnpm install', run: 'pnpm run' } as const;
        case 'bun': return { name: 'bun', install: 'bun install', run: 'bun run' } as const;
        default: return { name: 'npm', install: 'npm install', run: 'npm run' } as const;
    }
}

const reservedTactWords = [
    "Int", "Bool", "Builder", "Slice", "Cell", "Address", "String", "StringBuilder",
];

async function main(reader: Interface) {
    const cli = parseCLI<CliParams>(process.argv.slice(2));

    const templateRoot = join(__dirname, "../template/empty");
    const outPath = cli.args.at(0);

    const packageName = typeof outPath === "undefined" ? await reprompt(async () => {
        const placeholder = 'example';
        const fullPrompt = `Enter package name (${placeholder}): `;
        const result = (await reader.question(fullPrompt)) || placeholder;
        const validPackageName = /^(?=.{1,214}$)(?:@[a-z0-9]+(?:[._-][a-z0-9]+)*\/)?[a-z0-9]+(?:[._-][a-z0-9]+)*$/;
        if (!result.match(validPackageName)) {
            return;
        }
        return result;
    }) : basename(join(process.cwd(), outPath));

    const targetRoot = typeof outPath !== "undefined" ? join(process.cwd(), outPath) : join(process.cwd(), packageName);

    if (await folderExists(targetRoot)) {
        if (targetRoot !== process.cwd()) {
            console.error(`${targetRoot} already exists.`);
            process.exit(33);

            // NB! Nice to have for create-tact development. Comment is intentionally here.
            //     We don't want to ship an utility that calls `rm` at any stage.
            //
            // await reprompt(async () => {
            //     const fullPrompt = `${targetRoot} already exists. Remove it? (y/N): `;
            //     const result = (await reader.question(fullPrompt)).toLowerCase() || 'n';
            //     if (result === 'n') {
            //         process.exit(30);
            //     } else if (result === 'y') {
            //         console.error("Removing old project files...");
            //         await rm(targetRoot, { recursive: true, force: true });
            //         return '';
            //     } else {
            //         return;
            //     }
            // });
        }

        if (await isNonEmptyFolder(targetRoot)) {
            console.error(`Current directory is not empty.`);
            process.exit(33);
        }
    }

    const contractName = cli.flags.contractName ?? await reprompt(async () => {
        const placeholder = kebabToPascal(packageName);
        const fullPrompt = `Enter contract name (${placeholder}): `;
        const result = (await reader.question(fullPrompt)) || placeholder;
        const validContractName = /[A-Z][a-zA-Z0-9_]*/;
        if (!result.match(validContractName) || reservedTactWords.includes(result)) {
            return;
        }
        return result;
    });

    const manager = detectPackageManager();

    console.error("Creating project from template...");
    const files = await getFiles(templateRoot);
    for (const path of files) {
        const code = await readFile(path, "utf-8");
        const replacedCode = code
            .replace(/ContractName/g, contractName)
            .replace(/projectName/g, packageName)
            .replace(/packageName/g, packageName)
            .replace(/pmInstall/g, manager.install)
            .replace(/pmRun/g, manager.run);
        const targetPath = join(targetRoot, relative(templateRoot, path))
            .replace("gitignore", ".gitignore");
        const dir = dirname(targetPath);
        await mkdir(dir, { recursive: true });
        await writeFile(targetPath, replacedCode, "utf-8");
    }

    console.error("Setting preferred package manager for CI...");
    if (!await runCommand(`npm pkg set packageManager="${manager.name}@$(${manager.name} --version)"`, targetRoot)) {
        process.exit(31);
    }

    if (cli.flags.skipDepsInstallation !== "false") {
        console.error("Installing dependencies...");
        if (!await runCommand(manager.install, targetRoot)) {
            process.exit(31);
        }

        console.error("Building contracts...");
        if (!await runCommand(`${manager.run} build`, targetRoot)) {
            process.exit(31);
        }
    }

    if (cli.flags.initializeGitRepository !== "false") {
        if (await isGitInstalled()) {
            console.error("Initializing Git repository...");
            if (!await runCommand("git init -b main", targetRoot)) {
                process.exit(31);
            }
            if (!await runCommand("git add -A", targetRoot)) {
                process.exit(31);
            }
            if (!await runCommand("git commit -m initial", targetRoot)) {
                process.exit(31);
            }
        } else {
            console.error('Git is not installed');
            console.error('Git repository will not be initialized');
        }
    }

    const relativePath = relative(process.cwd(), targetRoot);
    if (relativePath !== "") {
        console.log('To switch to generated project, use');
        console.log(`cd ${relativePath}`)
    }
}

async function withReader<T>(cb: (reader: Interface) => Promise<T>): Promise<T> {
    const reader = createInterface({ input: stdin, output: stdout });
    try {
        return await cb(reader);
    } finally {
        reader.close()
    }
}

void withReader(main);