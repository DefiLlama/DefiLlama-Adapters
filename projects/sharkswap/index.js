const { getUniTVL } = require("../helper/unknownTokens")

module.exports = {
  sx: {
    tvl: getUniTVL({
      chain: 'sx',
      factory: '0x5Da4BEe3E6B545e9E28a7A303168A51eBd14C2Cf',
      useDefaultCoreAssets: true,
    })
  }
}