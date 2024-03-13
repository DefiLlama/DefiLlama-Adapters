const sdk = require('@defillama/sdk')
const { uniV3Export } = require('../helper/uniswapV3')
const {getUniTVL} = require('../helper/unknownTokens')

const concentraledLiquidity = uniV3Export({
  fraxtal: { factory: '0xAAA32926fcE6bE95ea2c51cB4Fcb60836D320C42', fromBlock: 1352717, },
})

module.exports = {
  misrepresentedTokens: true,
  fraxtal:{
    tvl: sdk.util.sumChainTvls([
        concentraledLiquidity.fraxtal.tvl,
        getUniTVL({ factory: '0xaaa16c016bf556fcd620328f0759252e29b1ab57', useDefaultCoreAssets: true,  hasStablePools: true, stablePoolSymbol: 'crAMM' }),
    ])
  },
}