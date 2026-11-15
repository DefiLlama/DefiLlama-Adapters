const sdk = require('@defillama/sdk')
const { getUniTVL } = require('../helper/unknownTokens')
const { uniV3Export } = require('../helper/uniswapV3')

// AurixDEX on Flare: Uniswap V2-style pools + concentrated-liquidity (Uniswap V3) pools
const V2_FACTORY = '0x2951Ae32056B037E43a6028cce7f735aff6214Ac'
const V3_FACTORY = '0x7b79037CcEd1fDfAF77d57214de5663E180E3Eb1'

const v2 = getUniTVL({ chain: 'flare', factory: V2_FACTORY, useDefaultCoreAssets: true })
const v3 = uniV3Export({ flare: { factory: V3_FACTORY, fromBlock: 72138196 } })

module.exports = {
  methodology: 'TVL is the value of the tokens held in AurixDEX liquidity pools on Flare: the reserves of every V2 pair created by the AurixDEX V2 factory, plus the token balances of every concentrated-liquidity (Uniswap V3-style) pool created by the AurixDEX V3 factory, found from its PoolCreated events.',
  start: '2026-11-14',
  flare: {
    tvl: sdk.util.sumChainTvls([v2, v3.flare.tvl]),
  },
}
