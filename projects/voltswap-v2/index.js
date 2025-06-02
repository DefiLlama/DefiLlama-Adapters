const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  meter: { tvl: getUniTVL({ factory: '0xb33dE8C0843F90655ad6249F20B473a627443d21', useDefaultCoreAssets: true, }), },
  base: { tvl: getUniTVL({ factory: '0x2A5478bE24F9E536cCb91DBF650EFD6cE6C00398', useDefaultCoreAssets: true, }), },
  misrepresentedTokens: true,
}