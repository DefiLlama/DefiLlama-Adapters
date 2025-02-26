const ADDRESSES = require('../helper/coreAssets.json')
const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  polygon_zkevm: {
    tvl: getUniTVL({
      factory: ADDRESSES.shibarium.BONE_1,
      useDefaultCoreAssets: true,
    })
  },
}