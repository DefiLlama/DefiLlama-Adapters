const addresses = require("./addresses.json");
const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs');


module.exports = {};

Object.keys(addresses).forEach(chain => {
  const { ERC20Handler: owner, Tokens } = addresses[chain]
  
  module.exports[chain] = {
    tvl: sumTokensExport({ chain, owner, tokens: [nullAddress, ...Tokens]})
  }
})
