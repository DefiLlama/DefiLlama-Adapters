const { getUniTVL } = require('../helper/unknownTokens')

const FACTORY = "0xB3Ae00A68F09E8b8a003B7669e2E84544cC4a385"
const WETH = "0x4200000000000000000000000000000000000006"

module.exports = {
  misrepresentedTokens: true,
  megaeth: {
    tvl: getUniTVL({
      factory: FACTORY, 
      useDefaultCoreAssets: true,
      fetchBalances: true,
      coreAssets: [WETH],
    })
  }
}
