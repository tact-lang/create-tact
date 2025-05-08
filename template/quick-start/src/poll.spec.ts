import "@ton/test-utils";
import { toNano } from "@ton/core";
import { Blockchain, SandboxContract, TreasuryContract } from "@ton/sandbox";
import { Poll } from "../output/poll_Poll";

describe("Poll contract", () => {
    let blockchain: Blockchain;
    let treasury: SandboxContract<TreasuryContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        blockchain.verbosity.print = false;
        treasury = await blockchain.treasury("deployer");
    });

    it("should be deployed correctly", async () => {
        // Prepare a contract wrapper with initial data given as 0n, 0n, 0n:
        // ID, option0, and option1 all set to 0
        const contract = blockchain.openContract(await Poll.fromInit(0n, 0n, 0n));

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

    it("should deploy Voter contracts correctly", async () => {
        const contract = blockchain.openContract(await Poll.fromInit(0n, 0n, 0n));
        let sendResult = await contract.send(treasury.getSender(), { value: toNano(1) }, null);
        expect(sendResult.transactions).toHaveTransaction({
            from: treasury.address,
            to: contract.address,
            deploy: true,
            success: true,
        });

        // ...
    });

    // NOTE: To add your own tests, simply copy-paste any of the `it()` clauses
    //       and adjust the logic to match your expected outcomes!
});
