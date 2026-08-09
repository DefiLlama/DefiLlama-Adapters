const TAYDEX_MARKET = '0x3ade22Fa1EF5ac75437A3734D91bA588E54875dd'
const BASE_USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'

async function tvl(api) {
  return api.sumTokens({
    owner: TAYDEX_MARKET,
    tokens: [BASE_USDC],
  })
}

module.exports = {
  methodology:
    'Counts native Base USDC held by the verified TayDex market contract as liquidity locked across TayDex prediction markets. Trading volume, wallet balances, and fees already transferred out of the contract are not included.',
  start: 1777393441,
  base: { tvl },
}
