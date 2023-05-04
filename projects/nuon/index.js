const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  arbitrum: {
    tvl: sumTokensExport({ owner: '0x27788F93eEbB53728b887f13c16AdA286e1b6e92' ,tokens: ['0x82af49447d8a07e3bd95bd0d56f35241523fbab1', '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9']})
  }
}