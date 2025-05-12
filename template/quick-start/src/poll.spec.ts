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

        // Let's create Toncoin wallets for two voters
        const wallet0 = await blockchain.treasury("voter-wallet-0");
        const wallet1 = await blockchain.treasury("voter-wallet-1");

        // And a small helper function for our needs
        const voteFrom = async (
            wallet: SandboxContract<TreasuryContract>,
            option: 0n | 1n,
            success = true,
        ) => {
            const res = await contract.send(wallet.getSender(), { value: toNano(1) }, {$$type: 'Vote', option });
            expect(res.transactions).toHaveTransaction({
                from: wallet.address,
                to: contract.address,
                success,
            });
        };

        // Vote for option 0 from the first voter's wallet
        await voteFrom(wallet0, 0n);

        // Vote for option 1 from the second voter's wallet
        await voteFrom(wallet1, 1n);

        // There should be a vote for option one and option two
        const state = await contract.getState();
        expect(state.option0).toBe(1n);
        expect(state.option1).toBe(1n);

        // Finally, voters should not be able to vote more than once.
        // That is, the resulting state after new vote attempts should not change.
        await voteFrom(wallet0, 0n); // repeat previous vote
        await voteFrom(wallet0, 1n); // attempt a different vote
        await voteFrom(wallet1, 1n); // repeat previous vote
        await voteFrom(wallet1, 0n); // attempt a different vote

        const finalState = await contract.getState();
        expect(finalState.option0).toBe(state.option0);
        expect(finalState.option1).toBe(state.option1);
    });

    // NOTE: To add your own tests, simply copy-paste any of the `it()` clauses
    //       and adjust the logic to match your expected outcomes!
});
