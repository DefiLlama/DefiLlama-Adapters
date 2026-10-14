const { getUniTVL } = require('../helper/unknownTokens')

const BSC_FACTORY = '0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C'

module.exports = {
  misrepresentedTokens: true,
  methodology: `Counts the token reserves in every liquidity pair created by the Melega DEX V2 factory (${BSC_FACTORY}) on BNB Chain. LP token supply is not counted separately.`,
  bsc: {
    tvl: getUniTVL({
      factory: BSC_FACTORY,
      useDefaultCoreAssets: true,
    }),
  },
}
