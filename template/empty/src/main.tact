import "@stdlib/ownable";

contract ContractName() {
    // empty receiver for deployment
    receive() {
        cashback(sender());
    }
}
