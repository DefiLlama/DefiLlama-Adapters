const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

// Kyte: non-custodial, fully collateralised options market on Robinhood Chain (https://kyte.sh).
// Sellers lock the underlying token (covered calls) or WETH (cash-secured puts) in the market contracts until the
// option is exercised, expires or the offer is cancelled. Older market sets keep settling their open positions, so all
// are counted.
const CALL_MARKETS = [
  '0x459cF18A424271A417547F6B349e962c09e492EE', // v1
  '0x15B5d324960234B193246B122C555e88E341eD72', // v2
  '0xb6759D8893601BB7c1A032eC8ea40C856a6adf80', // v3
]
const PUT_MARKETS = [
  '0xD1a3c2Fa0E7901437929B7518AD66d71B1d676a4', // v1
  '0x1025f5b1f7549a1192226ddC0D36E1359A8D1305', // v2
  '0x2E2d5DfB4cf30d15688Cc2DDD30641c78DFfcb35', // v3
]
// AssetRegistry contracts list every token options can be written on (v1, and the shared v2/v3 registry)
const REGISTRIES = ['0xcD076486FBd192e2E942dA9DB2B78817DF0d5235', '0x02f571e10B9c7303EB7A6284A7137b146e18658D']

const KYTE = '0x072D88c2F31F568C0F4B8F613692eB489541Ed45'
const STAKING_POOLS = [
  '0xD7253a90fd43507F44cF0934F3D5d7432760d17f', // current $KYTE staking pool
]

async function tvl(api) {
  const lists = await Promise.all(REGISTRIES.map((target) => api.fetchList({
    lengthAbi: 'uint256:assetCount',
    itemAbi: 'function listedTokens(uint256) view returns (address)',
    target,
  })))
  const tokens = [...new Set(lists.flat().map((t) => t.toLowerCase()))]
  // calls hold the underlying tokens, puts hold WETH; both sets are summed against both lists for safety
  return api.sumTokens({ owners: [...CALL_MARKETS, ...PUT_MARKETS], tokens: [...tokens, ADDRESSES.robinhood.WETH] })
}

module.exports = {
  methodology: 'TVL is the collateral locked in Kyte option markets: underlying tokens deposited by covered-call sellers and WETH deposited by cash-secured-put sellers, across all market versions. Staking counts $KYTE staked in the Kyte staking pool, which earns a share of protocol fees.',
  start: '2026-10-25',
  robinhood: {
    tvl,
    // sumTokens2 (not api.sumTokens) so the KYTE -> coingecko mapping in helper/tokenMapping.js is applied
    staking: (api) => sumTokens2({ api, owners: STAKING_POOLS, tokens: [KYTE] }),
  },
}
