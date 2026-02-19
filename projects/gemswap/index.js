const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  hallmarks: [
    ['2023-04-14',"Rug Pull"]
  ],
  misrepresentedTokens: true,
  era: {
    tvl: getUniTVL({
      factory: '0x065c8703132F2A38Be3d2dbF7Be6BE455930560c',
      useDefaultCoreAssets: true,
    })
  },
}; 