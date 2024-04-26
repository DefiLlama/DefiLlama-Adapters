const { getUniTVL } = require("../helper/unknownTokens")

const config = {
  mode: '0xE470699f6D0384E3eA68F1144E41d22C6c8fdEEf',
  blast: '0xA1da7a7eB5A858da410dE8FBC5092c2079B58413',
  merlin: '0xA1da7a7eB5A858da410dE8FBC5092c2079B58413',
  zeta: '0xA1da7a7eB5A858da410dE8FBC5092c2079B58413',
  degen: '0x2CcaDb1e437AA9cDc741574bDa154686B1F04C09',
  xlayer: '0x2ccadb1e437aa9cdc741574bda154686b1f04c09',
}

module.exports = {
  misrepresentedTokens: true,
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: getUniTVL({ factory: config[chain], useDefaultCoreAssets: true }),
  }
})