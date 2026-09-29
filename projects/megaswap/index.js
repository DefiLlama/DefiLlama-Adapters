const { getUniTVL } = require("../helper/unknownTokens");

const config = {
  megaeth: '0x72B94fA9F854Da1bCCD03F3bAB54cF60C32193F3',
}

module.exports = {
  misrepresentedTokens: true,
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl: getUniTVL({ factory: config[chain], useDefaultCoreAssets: true, }), }
})

