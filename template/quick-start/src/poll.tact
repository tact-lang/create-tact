/// The parent Poll contract deploys individual Voter contracts for each voter's Toncoin wallet.
/// This approach for building contract systems is called "sharding", and it is very common on TON.
/// Instead of attempting to make a single large contract process everything,
/// it is much better to deploy small contracts for each user
/// and have a single main (or master) contract provisioning those small contracts.
///
/// Sharding is the best approach on TON for many reasons:
/// * The maximum state size of each contract is very limited
/// * Contracts can only send and receive messages to interact with each other,
///   which makes all communications asynchronous
/// * The network itself can shard and process multiple contracts at a time
///
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

    /// Registers a binary receiver of the Vote message bodies.
    ///
    /// Notice that we do not use the received body
    /// and it is discarded with a wildcard _
    receive(msg: Vote) {
        // Limit available options.
        require(
            msg.option >= 0 && msg.option <= 1,
            "Only options allowed are: 0 and 1",
        );

        // Unconditionally process the vote.
        // Notice that the checks for duplicated votes is done in the Voter contract
        // to reduce the overall gas fees and simplify the checking logic
        // as we cannot query other contracts syncronously on TON.
        if (msg.option == 0) {
            self.option0 += 1;
        } else {
            self.option1 += 1;
        }

        // Send a message to existing Voter contract,
        // which will deploy it if it didn't exist yet.
        deploy(DeployParameters {
            value: 0,
            mode: SendRemainingValue, // use the excesses in the received message
            init: initOf Voter(sender(), myAddress(), false), // pass initial data
            body: inMsg().asCell(), // make sure the Vote message is sent
            // This is important for the remaining logic to work.
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

    /// As we've seen in the Counter contract, you can make a single getter that returns
    /// the contract's state with all its storage variables at once by using
    /// a special structure with the name of the given contract.
    get fun state(): Poll {
        return self;
    }
}

contract Voter(
    _origin: Address,
    poll: Address,
    hasVoted: Bool,
) {
    /// Registers a binary receiver of the Vote message bodies.
    /// Since its the only defined receiver, it will be used for the deployment.
    /// 
    /// Notice that we do not use the received body
    /// and it is discarded with a wildcard _
    receive(_: Vote) {
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

/// Defining a new message struct type,
/// which has a single `option` field and an automatically assigned 32-bit opcode prefix.
message Vote {
    /// Allows only 0 or 1
    option: Int as uint1;
}
