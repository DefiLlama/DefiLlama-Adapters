const { getUniTVL } = require("../helper/unknownTokens");

const config = {
  sonic: "0x3638Ca700D67D560Be2A2d0DD471640957564829"
}

module.exports = {
  misrepresentedTokens: true,
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl: getUniTVL({ factory: config[chain], useDefaultCoreAssets: true, }), }
})
