contract Poll(
    _randomId: Int as uint256,
    option0: Int as uint32,
    option1: Int as uint32,
) {
    // Empty receiver for the deployment,
    // which expects the `null` message body
    receive() {
        // Forward the remaining value in the
        // incoming message back to the sender
        cashback(sender());
    }

    // TODO: Describe
    receive(msg: Vote) {
        require(msg.option >= 0 && msg.option <= 1, "Only options allowed are: 0 and 1");

        // TODO: Give proper explanation.
        // Unconditionally process the vote
        // The check for whether the given voter has voted already will be done later
        if (msg.option == 0) {
            self.option0 += 1;
        } else {
            self.option1 += 1;
        }

        // Send a message to existing Voter contract,
        // which will deploy it if it didn't exist yet
        deploy(DeployParameters {
            value: 0,
            mode: SendRemainingValue,
            init: initOf Voter(sender(), myAddress(), false),
        });
    }

    // TODO: Describe
    //
    // We've received it because...
    bounced(msg: bounced<Vote>) {
        if (msg.option == 0) {
            self.option0 -= 1;
        } else {
            self.option1 -= 1;
        }
    }
}

contract Voter(
    _origin: Address,
    poll: Address,
    hasVoted: Bool,
) {
    receive() {
        require(
            self.poll == sender(),
            "New votes are accepted only from the parent Poll contract",
        );
        require(!self.hasVoted, "This voter has participated already");
        self.hasVoted = true;
    }

    get fun hasVoted(): Bool {
        return self.hasVoted;
    }
}

message Vote {
    // Allows only 0 or 1
    option: Int as uint1;
}
