const ADDRESSES = require('../helper/coreAssets.json')

const TAYDEX_MARKET = '0x3ade22Fa1EF5ac75437A3734D91bA588E54875dd'

async function tvl(api) {
  return api.sumTokens({
    owner: TAYDEX_MARKET,
    tokens: [ADDRESSES.base.USDC],
  })
}

module.exports = {
  methodology:
    'Counts native Base USDC held by the verified TayDex market contract as liquidity locked across TayDex prediction markets. Trading volume, wallet balances, and fees already transferred out of the contract are not included.',
  start: 1777393441,
  base: { tvl },
}
