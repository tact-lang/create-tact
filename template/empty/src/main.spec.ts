import "@ton/test-utils";
import { toNano } from "@ton/core";
import { Blockchain } from "@ton/sandbox";
import { ContractName } from "../output/projectName_ContractName";

it("should deploy correctly", async () => {
    const blockchain = await Blockchain.create();
    const contract = blockchain.openContract(await ContractName.fromInit());
    const deployer = await blockchain.treasury("deployer");

    // Send a message that `receive()` would handle
    const result = await contract.send(deployer.getSender(), { value: toNano(1) }, null);

    expect(result.transactions).toHaveTransaction({
        from: deployer.address,
        to: contract.address,
        deploy: true,
        success: true,
    });
});
