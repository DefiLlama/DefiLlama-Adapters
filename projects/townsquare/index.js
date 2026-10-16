module.exports = {
    methodology: "Total value of all coins held in the smart contracts of the protocol",
    // TVL temporarily hidden while the protocol stays listed; swap back to { tvl, borrowed } to re-enable
    monad: {
        tvl: () => ({}),
        borrowed: () => ({}),
    }
}
