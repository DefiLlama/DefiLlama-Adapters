const { getUniTVL } = require('../helper/unknownTokens')
const { staking } = require('../helper/staking')
const FACTORY = '0x7D2Ce25C28334E40f37b2A068ec8d5a59F11Ea54'
const pinksToken = '0x702b3f41772e321aacCdea91e1FCEF682D21125D'
const masterChef = '0xe981676633dCf0256Aa512f4923A7e8DA180C595'

module.exports = {
  bsc: {
    tvl: getUniTVL({
      factory: FACTORY,
      useDefaultCoreAssets: true,
    }),
    staking: staking(masterChef, pinksToken),
  }
}