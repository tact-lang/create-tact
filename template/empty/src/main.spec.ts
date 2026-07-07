import "@ton/test-utils";
import { toNano } from "@ton/core";
import { Blockchain, SandboxContract, TreasuryContract } from "@ton/sandbox";
import { ContractName } from "../output/projectName_ContractName";

describe("ContractName", () => {
    let blockchain: Blockchain;
    let treasury: SandboxContract<TreasuryContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        blockchain.verbosity.print = false;
        treasury = await blockchain.treasury("deployer");
    });

    it("should be deployed correctly", async () => {
        // Prepare a contract wrapper with initial data
        const contract = blockchain.openContract(await ContractName.fromInit());

        // Send a message that `receive()` would handle
        const sendResult = await contract.send(treasury.getSender(), { value: toNano(1) }, null);

        // Expect a successful deployment
        expect(sendResult.transactions).toHaveTransaction({
            from: treasury.address,
            to: contract.address,
            deploy: true,
            success: true,
        });
    });

    it("should do something else", async () => {
        const contract = blockchain.openContract(await ContractName.fromInit());
        let sendResult = await contract.send(treasury.getSender(), { value: toNano(1) }, null);
        expect(sendResult.transactions).toHaveTransaction({
            from: treasury.address,
            to: contract.address,
            deploy: true,
            success: true,
        });

        // ...up to you!
    });

    // NOTE: To add your own tests, simply copy-paste any of the `it()` clauses
    //       within the `describe()`, and adjust the logic to match your expected outcome(s)
});
