const { getUniTVL } = require('../helper/unknownTokens')
const { uniV3Export } = require('../helper/uniswapV3')
const { mergeExports } = require('../helper/utils')

const v2 = {
  misrepresentedTokens: true,
  monad: {
    tvl: getUniTVL({ factory: '0x6DBb0b5B201d02aD74B137617658543ecf800170', useDefaultCoreAssets: true, hasStablePools: true }),
  },
}

const v3 = uniV3Export({
  monad: { factory: '0x2A6CE23C5017aF1b07B9c4E4014442aDE18Bd404', fromBlock: 54650081 },
})

module.exports = mergeExports([v2, v3])
