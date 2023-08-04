
const factory = "0xd654CbF99F2907F06c88399AE123606121247D5C"

const { getUniTVL } = require('../helper/unknownTokens');

module.exports = {
  okexchain: {
    tvl: getUniTVL({
      factory,
      useDefaultCoreAssets: true,
    })
  },
}
