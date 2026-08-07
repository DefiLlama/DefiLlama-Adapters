const { queryContract } = require('../helper/chain/cosmos.js');

// node test.js projects/figure-markets-democratized-prime-auto/index.js

const pool = "pb1gqw3m5ftuu0hdcj646ppgmrp7ual3kkjj2wq6usqsfe0ntfmsc7s8fh70c"

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
    methodology: 'TVL represents excess Auto lending supply that is not yet matched with borrowers',
    provenance: {
        tvl: (api) => getBalances(api, false),
        borrowed: (api) => getBalances(api, true),
    }
}
