const config = require("../macaron/config");
const { sumTokensExport, } = require("../helper/unwrapLPs");

module.exports = {}

function setChainTVL(chain) {
  const { treasury, erc20s, } = config[chain]

  module.exports[chain] = {
    tvl: sumTokensExport({ owner: treasury, tokens: erc20s })
  }
}

Object.keys(config).forEach(setChainTVL)