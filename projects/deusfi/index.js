const contracts = require("./contracts.json");
const { sumTokensExport } = require('../helper/unwrapLPs')
module.exports = {};

Object.keys(contracts).forEach(chain => {
  const tokensAndOwners = contracts[chain].map(i => ([i.token, i.address]))
  module.exports[chain] = {
    tvl: sumTokensExport({ chain, tokensAndOwners, })
  }
})