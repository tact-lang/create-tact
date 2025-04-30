import { mkdir, readdir, readFile, stat, writeFile } from "fs/promises";
import { dirname, join, relative } from "path";
import { createInterface, Interface } from "readline/promises";
import { stdin, stdout } from 'process';
import { exec } from "child_process";
import { promisify } from "util";

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

const templateNameRoots = {
    "empty": join(__dirname, "../template/empty"),
    "counter": join(__dirname, "../template/counter"),
    // TODO: actual templates
    "something...": join(__dirname, "../template/something"),
};

function templateChoicePrompt(
    _: Interface,
    options: Record<string, string>,
): Promise<string> {
    return new Promise(async (resolve) => {
        const choices = Object.entries(options);
        let currentIndex = 0;

        const renderMenu = () => {
            // TODO: double-buffer or something
            console.clear();
            console.log("Select a template:");
            console.log();

            choices.forEach(([key, _], index) => {
                const prefix = index === currentIndex ? "› " : "  ";
                const highlight = index === currentIndex ? "\x1b[36m" : "";
                const reset = index === currentIndex ? "\x1b[0m" : "";
                console.log(`${prefix}${highlight}${key}${reset}`);
            });

            console.log("\nUse ↓/j and ↑/k to move, Enter to select");
        };

        // NOTE: Idk how to apply this to reader: Interface,
        //       considering that upon receiving an Enter everything is reset
        stdin.setRawMode(true);
        stdin.resume();

        // Handle key presses
        const keyHandler = (key: string) => {
            // ↑/k
            if (key === '\u001B[A' || key === '\u006B') {
                currentIndex = (currentIndex > 0) ? currentIndex - 1 : choices.length - 1;
                renderMenu();
            // ↑/j
            } else if (key === '\u001B[B' || key === '\u006A') {
                currentIndex = (currentIndex < choices.length - 1) ? currentIndex + 1 : 0;
                renderMenu();
            // Enter
            } else if (key === '\r') {
                // NOTE: See the previous NOTE
                stdin.removeListener('data', keyHandler);
                stdin.setRawMode(false);
                stdin.pause();
                // We're guaranteed to have something selected, so `!.at(1)!` here is fine
                resolve(choices[currentIndex]!.at(1)!);
            // Ctrl+C
            } else if (key === '\u0003') {
                process.exit();
            } else {
                renderMenu();
            }
        };

        stdin.on('data', (data) => {
            const key = data.toString();

            // Handle character sequences of the arrow keys
            if (key === '\u001B') {
                const buffer: string[] = [key];
                const readNext = () => {
                    stdin.once('data', (chunk) => {
                        buffer.push(chunk.toString());
                        if (buffer.join('') === '\u001B[') {
                            stdin.once('data', (direction) => {
                                buffer.push(direction.toString());
                                keyHandler(buffer.join(''));
                            });
                        } else {
                            keyHandler(buffer.join(''));
                        }
                    });
                };

                readNext();
            } else {
                keyHandler(key);
            }
        });

        renderMenu();
    });
}

async function main(reader: Interface) {
    const packageName = await reprompt(async () => {
        const placeholder = 'example';
        const fullPrompt = `Enter package name (${placeholder}): `;
        const result = (await reader.question(fullPrompt)) || placeholder;
        const validPackageName = /^(?=.{1,214}$)(?:@[a-z0-9]+(?:[._-][a-z0-9]+)*\/)?[a-z0-9]+(?:[._-][a-z0-9]+)*$/;
        if (!result.match(validPackageName)) {
            return;
        }
        return result;
    });

    const targetRoot = join(process.cwd(), packageName);

    if (await folderExists(targetRoot)) {
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

    const contractName = await reprompt(async () => {
        const placeholder = kebabToPascal(packageName);
        const fullPrompt = `Enter contract name (${placeholder}): `;
        const result = (await reader.question(fullPrompt)) || placeholder;
        const validContractName = /[A-Z][a-zA-Z0-9_]*/;
        if (!result.match(validContractName) || reservedTactWords.includes(result)) {
            return;
        }
        return result;
    });

    const templateRoot = await reprompt(async () => {
        return await templateChoicePrompt(reader, templateNameRoots);
    });

    const manager = detectPackageManager();

    console.error("Creating project from the template...");
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

    console.error("Installing dependencies...");
    if (!await runCommand(manager.install, targetRoot)) {
        process.exit(31);
    }

    console.error("Building contracts...");
    if (!await runCommand(`${manager.run} build`, targetRoot)) {
        process.exit(31);
    }

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

    console.log('To switch to generated project, use');
    console.log(`cd ${relative(process.cwd(), targetRoot)}`)
}

async function withReader<T>(cb: (reader: Interface) => Promise<T>): Promise<T> {
    stdin.setEncoding('utf8');
    const reader = createInterface({ input: stdin, output: stdout });
    try {
        return await cb(reader);
    } finally {
        reader.close()
    }
}

void withReader(main);
