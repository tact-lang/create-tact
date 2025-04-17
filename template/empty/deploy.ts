import { resolve } from "path";
import { readFile } from "fs/promises";
import { contractAddress } from "@ton/core";
import { Name } from "./output/{{name}}_Name";
import { prepareTactDeployment } from "@tact-lang/deployer";

async function main() {
    console.log("Deploying...");
    const testnet = true;
    const init = await Name.init();
    const prepare = await prepareTactDeployment({
        pkg: await readFile(resolve(__dirname, "dist", "{{name}}_Name.pkg")),
        data: init.data.toBoc(),
        testnet,
    });
    const address = contractAddress(0, init).toString({ testOnly: testnet });
    console.log(`Contract address: ${address}`);
    console.log(`Please, follow deployment link: ${prepare}`);
}

void main();