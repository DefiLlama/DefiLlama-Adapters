const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  meter: {
    tvl: getUniTVL({ factory: '0xb33dE8C0843F90655ad6249F20B473a627443d21', chain: 'meter', useDefaultCoreAssets: true, }),
  },
  misrepresentedTokens: true,
}