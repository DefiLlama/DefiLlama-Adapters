const { getUniTVL } = require('../helper/unknownTokens')
const { uniV3Export } = require('../helper/uniswapV3')

const V2_FACTORY = '0x4373b7Fcf5059A785843cD224129e01d243Aef71'
const V3_FACTORY = '0x0dfb1Bb755d872EA1fa4d95E4ad0c2E6317Ce9B9'
const V3_FROM_BLOCK = 14294547

module.exports = {
  misrepresentedTokens: true,
  methodology: `Counts the tokens locked on AMM pools, pulling the data from the KrokoSwap V2 factory (for V2 pools) and V3 factory (for V3 pools).`,
  kasplex: {
    tvl: getUniTVL({ factory: V2_FACTORY, useDefaultCoreAssets: true, permitFailure: true }),
  },
  ...uniV3Export({
    kasplex: {
      factory: V3_FACTORY,
      fromBlock: V3_FROM_BLOCK,
    }
  }),
}
