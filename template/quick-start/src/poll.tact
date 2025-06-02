/// The following contract is similar to a poll feature you've probably seen on many
/// social media networks out there, except that now it works on the blockchain
/// and is decentralized — anyone can deploy their own poll and count unique votes
/// for some options. In this example, the poll only has 2 options to pick from.
///
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

    /// Registers a binary receiver of the `Vote` message bodies.
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

    /// This is a special receiver — it only handles the `Vote` message bodies
    /// that have bounced back to this contract, which can only happen if this contract
    /// has sent a message and there was an error during its processing on the recepients' side.
    ///
    /// In our case, the receiver of the regular `Vote` message bodies sends a deployment message
    /// with the `Vote` body, processing of which can intentionally cause an error if the voter
    /// has voted already. And that would mean we need to revert the excessive vote change
    /// applied earlier in the previous receiver.
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

/// Child contract for each of the voter's Toncoin wallet.
/// By creating an individual contract we circumvent the problem of the limited contract's state
/// and effectively use the whole blockchain as a map of voters that did participate in a given poll.
///
/// These contracts are not deployed on their own and isn't listed as an entrypoint in tact.config.json.
/// Instead, they are deployed by the parent Poll contract.
///
/// Since contract addresses on TON are determined on deployment from the initial code and data,
/// it is crucial for the Voter contract to have some data that will be unique to each voter.
/// That is why there is a seemingly unused `_origin` address stored in the contract's persistent state.
contract Voter(
    /// An address of the voter's Toncoin wallet.
    _origin: Address,

    /// Address of the `Poll` contract this Voter will participate in.
    poll: Address,

    /// Whether this voter voted already.
    /// This field is needed to only process unique votes
    /// and it should be set to true upon the deployment of this contract.
    hasVoted: Bool,
) {
    /// Registers a binary receiver of the `Vote` message bodies.
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
}

/// Defining a new message struct type,
/// which has a single `option` field and an automatically assigned 32-bit opcode prefix.
message Vote {
    /// Allows only 0 or 1
    option: Int as uint1;
}
