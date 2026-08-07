const { queryContract } = require('../helper/chain/cosmos.js');
const BigNumber = require('bignumber.js');

// node test.js projects/figure-markets-democratized-prime-auto/index.js

const pool = "pb1gqw3m5ftuu0hdcj646ppgmrp7ual3kkjj2wq6usqsfe0ntfmsc7s8fh70c"

const getBalances = async (api, isBorrowed) => {
    const state = await queryContract({ contract: pool, chain: 'provenance', data: {get_state: {}}})
    const liquidity = new BigNumber(state.reserve?.total_liquidity || 0).integerValue(BigNumber.ROUND_DOWN)
    const borrowed = new BigNumber(state.reserve?.total_borrow || 0).integerValue(BigNumber.ROUND_DOWN)
    const collateral = liquidity.minus(borrowed)
    const token = state?.contract?.ld?.n

    if (token && !liquidity.isZero()) {
        api.add(token, (isBorrowed ? borrowed : collateral).toFixed(0))
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
