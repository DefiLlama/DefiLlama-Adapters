const { queryContract } = require('../helper/chain/cosmos.js');

// node test.js projects/figure-markets-democratized-prime-home-equity/index.js

const pool = "pb1lgdznp6dyljdq40xvcknkzcgelh2es0udwnx9rzn7c5q55435l3sx6v5a6"

const getBalances = async (api, isBorrowed) => {
    const state = await queryContract({ contract: pool, chain: 'provenance', data: {get_state: {}}})
    const liquidity = Math.trunc(state.reserve?.total_liquidity)
    const borrowed = Math.trunc(state.reserve?.total_borrow)
    const collateral = liquidity - borrowed
    const token = state?.contract?.ld?.n

    if (token && liquidity) {
        api.add(token, isBorrowed ? borrowed : collateral)
    }
}

module.exports = {
    timetravel: false,
    doublecounted: true,
    methodology: 'TVL represents excess Home Equity lending supply that is not yet matched with borrowers',
    provenance: {
        tvl: (api) => getBalances(api, false),
        borrowed: (api) => getBalances(api, true),
    }
}
