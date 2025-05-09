////////////////////////////////////////////////////////////////
//                                                            //
//  Welcome to your first Tact smart contract!                //
//  ------------------------------------------                //
//                                                            //
//           ;@                                               //
//          88;        ,d                            ,d       //
//        888:         88                            88       //
//      %88%8888X;   MM88MMM ,adPPYYba,  ,adPPYba, MM88MMM    //
//    ;@8888@8XX@      88    ""     `Y8 a8"     ""   88       //
//         8X88        88    ,adPPPPP88 8b           88       //
//        888          88,   88,    ,88 "8a,   ,aa   88,      //
//      S88            "Y888 `"8bbdP"Y8  `"Ybbd8"'   "Y888    //
//     t8;                                                    //
//                                                            //
////////////////////////////////////////////////////////////////

/// Let's define a simple counter contract.
/// Comments below describe each of its parts.
contract Counter(
    // The following are persistent state variables of the contract.
    //
    // Their default (initial) values are supplied during deployment
    // and the current values are kept on the Blockchain,
    // persisting between transactions.
    //
    counter: Int as uint32, // actual value of the counter
    id: Int as uint32, // a unique ID to deploy multiple instances
    //                    of this contract in a same workchain
) {
    /// Registers a receiver of empty messages from other contracts.
    ///
    /// It handles internal messages with `null` body
    /// and is very handy and cheap for the deployments.
    ///
    /// To deploy this contract in the local TON emulator, Sandbox,
    /// we'll send a `null` body message from the special "treasury" contract
    /// to the address of this one. See the `deploy.ts` script for more.
    receive() {
        // Forward the remaining value in the
        // incoming message back to the sender.
        cashback(sender());
    }

    /// Registers a binary receiver of the Add message bodies.
    ///
    /// Notice that we do not use the received body
    /// and it is discarded with a wildcard _
    receive(_: Add) {
        // Duh
        self.counter += 1;

        // Forward the remaining value in the
        // incoming message back to the sender
        cashback(sender());
    }

    /// A getter function, which can only be called from off-chain
    /// and never by other contracts. This one is useful to see the counter state.
    get fun counter(): Int {
        return self.counter; // ← current counter value in the contract's storage
    }

    /// Another getter function, now for the ID.
    get fun id(): Int {
        return self.id; // ← current ID value in the contract's storage (persistent state)
    }

    /// Notice that you can make a single getter that returns the contract's state
    /// with all its storage variables at once by using a special structure
    /// with the name of the given contract.
    get fun state(): Counter {
        return self;
    }
}

/// Defining a new message struct type,
/// which has no fields and a manually assigned 32-bit opcode prefix.
///
/// The opcode goes before all message body fields and serves as a tag,
/// helping contracts differentiate the message bodies and parse their subsequent
/// contents in accordance to their message struct layouts.
///
/// In our case there are no fields after the opcode as the message struct is empty,
/// but in the real-world contracts there are about 4-5 fields on average
/// in each defined message struct.
message(0x12345678) Add {}

// If you've got your grip on the Counter contract,
// let's move to the second one: Open-ended Poll (poll.tact)
