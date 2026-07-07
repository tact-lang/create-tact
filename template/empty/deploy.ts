import { resolve } from "path";
import { readFile } from "fs/promises";
import { contractAddress } from "@ton/core";
import { prepareTactDeployment } from "@tact-lang/deployer";
import { ContractName } from "./output/projectName_ContractName";

async function main() {
    console.log("Deploying...");
    const toProduction = process.argv.length === 3 && process.argv[2] === "mainnet";

    // ContractName
    {
        // Default (initial) values of persistent state variables are supplied here
        const init = await ContractName.init();

        // Obtaining a convenient link to deploy a new contract in the mainnet or testnet,
        // which could be used by your existing Toncoin wallet.
        const prepare = await prepareTactDeployment({
            // The .pkg file is a special JSON file containing the compiled contract,
            // its dependencies, and all related metadata.
            //
            // See: https://docs.tact-lang.org/ref/evolution/otp-006/
            pkg: await readFile(resolve(__dirname, "output", "projectName_ContractName.pkg")),
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
}

void main();
