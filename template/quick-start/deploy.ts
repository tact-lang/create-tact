import { resolve } from "path";
import { readFile } from "fs/promises";
import { contractAddress } from "@ton/core";
import { prepareTactDeployment } from "@tact-lang/deployer";
import { Counter } from "./output/counter_Counter";
import { Poll } from "./output/poll_Poll";

async function main() {
    console.log("Deploying...");
    const toProduction = process.argv.length === 3 && process.argv[2] === "mainnet";

    // 1. Counter contract
    {
        // Default (initial) values of persistent state variables are supplied here
        const init = await Counter.init(0n, 0n);

        // Obtaining a convenient link to deploy a new contract in the mainnet or testnet,
        // which could be used by your existing Toncoin wallet.
        const prepare = await prepareTactDeployment({
            // The .pkg file is a special JSON file containing the compiled contract,
            // its dependencies, and all related metadata.
            // 
            // See: https://docs.tact-lang.org/ref/evolution/otp-006/
            pkg: await readFile(resolve(__dirname, "output", "counter_Counter.pkg")),
            data: init.data.toBoc(),
            testnet: !toProduction,
        });

        // Contract addresses on TON are obtained deterministically,
        // from the initial code and data. The most used chain is basechain,
        // which is the workchain with ID 0.
        const address = contractAddress(0, init).toString({ testOnly: !toProduction });
        console.log(`Contract address: ${address}`);
        console.log(`Please, follow deployment link: ${prepare}`);
    }

    // 2. Poll contract — the procedure is the same,
    //    but persistent state variables and contract output would differ.
    {
        const init = await Poll.init(0n, 0n, 0n);
        const prepare = await prepareTactDeployment({
            pkg: await readFile(resolve(__dirname, "output", "poll_Poll.pkg")),
            data: init.data.toBoc(),
            testnet: !toProduction,
        });
        const address = contractAddress(0, init).toString({ testOnly: !toProduction });
        console.log(`Contract address: ${address}`);
        console.log(`Please, follow deployment link: ${prepare}`);
    }
}

void main();
