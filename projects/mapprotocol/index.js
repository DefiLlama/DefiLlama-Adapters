const { sumTokensExport } = require("../helper/sumTokens");
const config = require("./config");

const MOS_CONTRACT = "0x630105189c7114667a7179aa57f07647a5f42b7f";

module.exports = {};

Object.keys(config).forEach(chain => {
  const { tokens } = config[chain]
  module.exports[chain] = {
    tvl: sumTokensExport({ owner: MOS_CONTRACT, tokens: Object.values(tokens) })
  }
})
