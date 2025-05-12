
const { getUniTVL } = require("../helper/unknownTokens");

const config = {
  xlayer: '0xF7c16c5C5AF8838A884cF409543fdBE4Abd3D81d',
}

module.exports = {
  deadFrom: "2025-01-01",
  misrepresentedTokens: true,
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl: getUniTVL({ factory: config[chain], useDefaultCoreAssets: true, }), }
})