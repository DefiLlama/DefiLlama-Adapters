const { getUniTVL } = require("../helper/unknownTokens")

module.exports = {
  sx: {
    tvl: getUniTVL({
      chain: 'sx',
      factory: '0x6A482aC7f61Ed75B4Eb7C26cE8cD8a66bd07B88D',
      useDefaultCoreAssets: true,
    })
  }
}