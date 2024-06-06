const { getUniTVL } = require('../helper/unknownTokens')
const factory_contract = "0xD707d9038C1d976d3a01c770f01CB73a1fd305Cd"

module.exports = {
  lachain: {
    tvl: getUniTVL({ factory: factory_contract, useDefaultCoreAssets: true }),
  }
};
