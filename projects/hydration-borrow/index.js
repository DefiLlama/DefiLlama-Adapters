const { tvl, borrowed } = require('./api')

module.exports = {
    timetravel: false,
    methodology: "Counts the total assets supplied (TVL) and total assets borrowed in the Hydration borrow market. TVL is defined as the sum of available liquidity and total borrowed assets in the lending pools.",
    hydration: {
        tvl: tvl,
        borrowed: borrowed,
    }
}