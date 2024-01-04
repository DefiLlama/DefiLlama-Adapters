async function suiTVL() {
    return {
        sui: 0,
    }
}

module.exports = {
    timetravel: true,
    misrepresentedTokens: false,
    methodology: "The total value locked within Aftermath's Aggregator.",
    sui: {
        tvl: suiTVL,
    }
}
