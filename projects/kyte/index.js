const ADDRESSES = require('../helper/coreAssets.json')

// Kyte: fully collateralised call and put options on Robinhood Chain. Every option is backed 1:1 at creation:
// a covered call locks the underlying token in CallMarket, a cash-secured put locks the full strike in WETH in
// PutMarket. Collateral only ever moves to the seller (expiry, cancel) or the holder (exercise). Older market
// versions still hold collateral for options that were open when the contracts were upgraded, so they are summed too.
const ASSET_REGISTRY = '0xcD076486FBd192e2E942dA9DB2B78817DF0d5235' // every token options can be written on
const CALL_MARKETS = [
  '0x459cF18A424271A417547F6B349e962c09e492EE', // current
  '0xb6759D8893601BB7c1A032eC8ea40C856a6adf80', // v3
  '0x15B5d324960234B193246B122C555e88E341eD72', // v2
]
const PUT_MARKETS = [
  '0xD1a3c2Fa0E7901437929B7518AD66d71B1d676a4', // current
  '0x2E2d5DfB4cf30d15688Cc2DDD30641c78DFfcb35', // v3
  '0x1025f5b1f7549a1192226ddC0D36E1359A8D1305', // v2
]
const STAKING_POOL = '0xD7253a90fd43507F44cF0934F3D5d7432760d17f'
const KYTE = '0x072D88c2F31F568C0F4B8F613692eB489541Ed45'

async function tvl(api) {
  const count = await api.call({ abi: 'uint256:assetCount', target: ASSET_REGISTRY })
  const tokens = await api.multiCall({
    abi: 'function listedTokens(uint256) view returns (address)',
    calls: Array.from({ length: Number(count) }, (_, i) => ({ target: ASSET_REGISTRY, params: [i] })),
  })
  await api.sumTokens({ owners: CALL_MARKETS, tokens })
  return api.sumTokens({ owners: PUT_MARKETS, tokens: [ADDRESSES.robinhood.WETH] })
}

async function staking(api) {
  return api.sumTokens({ owner: STAKING_POOL, tokens: [KYTE] })
}

module.exports = {
  methodology:
    'TVL is the collateral locked behind open options on Robinhood Chain: the underlying tokens held by the CallMarket contracts (covered calls) and the WETH held by the PutMarket contracts (cash-secured puts). The token list is read from the on-chain AssetRegistry. Staking is the $KYTE locked in the StakingPool, which receives 30% of protocol fees.',
  start: '2026-11-01',
  robinhood: { tvl, staking },
}
