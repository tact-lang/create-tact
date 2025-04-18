import { resolve } from "path";
import { readFile } from "fs/promises";
import { contractAddress } from "@ton/core";
import { prepareTactDeployment } from "@tact-lang/deployer";
import { ContractName } from "./output/projectName_ContractName";

async function main() {
    console.log("Deploying...");
    const testnet = true;
    const init = await ContractName.init();
    const prepare = await prepareTactDeployment({
        pkg: await readFile(resolve(__dirname, "dist", "projectName_ContractName.pkg")),
        data: init.data.toBoc(),
        testnet,
    });
    const address = contractAddress(0, init).toString({ testOnly: testnet });
    console.log(`Contract address: ${address}`);
    console.log(`Please, follow deployment link: ${prepare}`);
}

void main();