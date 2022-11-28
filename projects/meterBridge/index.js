const addresses = require("./addresses.json");
const { sumTokensExport, nullAddress, } = require('../helper/unwrapLPs')

module.exports = {};

Object.keys(addresses).forEach(chain => {
  const {ERC20Handler, Tokens, } = addresses[chain]
  module.exports[chain] = {
    tvl: sumTokensExport({ chain, owner: ERC20Handler, tokens: [...Tokens, nullAddress, ]})
  }
})
