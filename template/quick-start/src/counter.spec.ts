import "@ton/test-utils";
import { toNano } from "@ton/core";
import { Blockchain, SandboxContract, TreasuryContract } from "@ton/sandbox";
import { Counter } from "../output/counter_Counter";

describe("Counter contract", () => {
    let blockchain: Blockchain;
    let treasury: SandboxContract<TreasuryContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        blockchain.verbosity.print = false;
        treasury = await blockchain.treasury("deployer");
    });

    it("should be deployed correctly", async () => {
        // Prepare a contract wrapper with initial data given as 0n, 0n:
        // counter and ID both set to 0
        const contract = blockchain.openContract(await Counter.fromInit(0n, 0n));

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

    it("should increase the counter", async () => {
        const contract = blockchain.openContract(await Counter.fromInit(0n, 0n));
        let sendResult = await contract.send(treasury.getSender(), { value: toNano(1) }, null);
        expect(sendResult.transactions).toHaveTransaction({
            from: treasury.address,
            to: contract.address,
            deploy: true,
            success: true,
        });

        // Let's increase the counter 3 times
        let incTimes = 3;
        while (incTimes--) {
            // And each time check the counter state before and after the Add message received
            const counterBefore = await contract.getCounter();

            // The message should be sent and received successfully
            sendResult = await contract.send(treasury.getSender(), { value: toNano(1) }, { $$type: 'Add' });
            expect(sendResult.transactions).toHaveTransaction({
                from: treasury.address,
                to: contract.address,
                success: true,
            });

            // The counter's state after receiving the Add message should increase by 1
            const counterAfter = await contract.getCounter();
            expect(counterAfter - counterBefore).toBe(1n);
        }
    });

    // NOTE: To add your own tests, simply copy-paste any of the `it()` clauses
    //       and adjust the logic to match your expected outcomes!
});
