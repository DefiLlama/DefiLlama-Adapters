const {getUniTVL} = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  polygon:{
    tvl: getUniTVL({
      factory: '0x1d21Db6cde1b18c7E47B0F7F42f4b3F68b9beeC9',
      useDefaultCoreAssets: true,
      hasStablePools: true,
    })
  },
}

