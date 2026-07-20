const sdk = require('@defillama/sdk')
const { getUniTVL } = require('../helper/unknownTokens')
const { uniV3Export } = require('../helper/uniswapV3')

// GIGA DEX - liquidity coordination layer on Robinhood Chain (chainId 4663)
// docs: https://docs.gigadex.fi | contracts: https://docs.gigadex.fi/security/contracts
const CLASSIC_FACTORY = '0x6Fdf38f92eAd1adFc04B73aaa947ab254f6c0916' // Uniswap V2 fork (stable + volatile pools)
const CL_FACTORY = '0xEce6eCd61177336ea6Fb9b17937AC439D85EE20B'      // PancakeSwap V3 fork (concentrated liquidity)

const v3 = uniV3Export({
  robinhood: { factory: CL_FACTORY, fromBlock: 1 },
})

module.exports = {
  misrepresentedTokens: true,
  methodology: 'TVL counts liquidity across GIGA DEX pools: Classic AMM pairs (Uniswap V2 fork) are discovered via the Classic Factory, and Concentrated Liquidity pools (PancakeSwap V3 fork) are discovered via PoolCreated events from the CL Factory. Token balances held by these pools are summed.',
  robinhood: {
    tvl: sdk.util.sumChainTvls([
      getUniTVL({ factory: CLASSIC_FACTORY, useDefaultCoreAssets: true }),
      v3.robinhood.tvl,
    ]),
  },
}
