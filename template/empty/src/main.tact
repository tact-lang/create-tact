import "@stdlib/ownable";

contract {{name}}() {
    // empty receiver for deployment
    receive() {
        cashback(sender());
    }
}
