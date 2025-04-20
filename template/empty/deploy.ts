import { resolve } from "path";
import { readFile } from "fs/promises";
import { contractAddress } from "@ton/core";
import { prepareTactDeployment } from "@tact-lang/deployer";
import { ContractName } from "./output/projectName_ContractName";

async function main() {
    console.log("Deploying...");
    const toProduction = process.argv.length === 3 && process.argv[2] === "mainnet";
    const init = await ContractName.init();
    const prepare = await prepareTactDeployment({
        pkg: await readFile(resolve(__dirname, "output", "projectName_ContractName.pkg")),
        data: init.data.toBoc(),
        testnet: !toProduction,
    });
    const address = contractAddress(0, init).toString({ testOnly: !toProduction });
    console.log(`Contract address: ${address}`);
    console.log(`Please, follow deployment link: ${prepare}`);
}

void main();
