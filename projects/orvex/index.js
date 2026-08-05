const sdk = require('@defillama/sdk')
const { getUniTVL } = require('../helper/unknownTokens')
const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

// Orvex is deployed on Robinhood Chain (Arbitrum Orbit L2, chainId 4663).
// Contracts source: https://docs.orvex.fi
const V2_FACTORY = '0x5c98b2d892b37c9a1D3b69472bdDc172A64CdC09' // PairFactoryUpgradeable (Solidly v2)
const V4_CL_POOL_MANAGER = '0xd01C774d4A66408326Bc65728Ac5Ae5aAf004032'
const V4_VAULT = '0xFe7E25dE55e5cBbEcCcb661F3679F873f72B9b0D'
const V4_FROM_BLOCK = 3074079

// v2 pairs (Solidly-fork, stable + volatile curves)
const v2Tvl = getUniTVL({
  factory: V2_FACTORY,
  useDefaultCoreAssets: true,
  hasStablePools: true,
})

// v4 CL pools: pool token pairs are enumerated from CLPoolManager Initialize
// events; all funds are held in the singleton Vault contract.
async function v4Tvl(api) {
  const logs = await getLogs2({
    api,
    target: V4_CL_POOL_MANAGER,
    fromBlock: V4_FROM_BLOCK,
    eventAbi: 'event Initialize(bytes32 indexed id, address indexed currency0, address indexed currency1, address hooks, uint24 fee, bytes32 parameters, uint160 sqrtPriceX96, int24 tick)',
  })

  const tokens = new Set()
  logs.forEach(log => {
    tokens.add(String(log.currency0).toLowerCase())
    tokens.add(String(log.currency1).toLowerCase())
  })

  return sumTokens2({ api, tokens: Array.from(tokens), owner: V4_VAULT })
}

module.exports = {
  methodology: 'TVL is the value of tokens locked in Orvex v2 liquidity pairs (Solidly-fork PairFactoryUpgradeable) plus tokens held in the Orvex v4 concentrated liquidity Vault.',
  robinhood: {
    tvl: sdk.util.sumChainTvls([v2Tvl, v4Tvl]),
  },
}
