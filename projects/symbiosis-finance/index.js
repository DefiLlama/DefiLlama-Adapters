const config = require("./config");
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  methodology: 'Counts the amount of stables locked in Symbiosis protocol contracts: Portals V1, NervePools V1, Portals V2, OmniPool V2',
};

config.chains.forEach(chainInfo => {
  const {name: chain, tokens, holders} = chainInfo
  module.exports[chain] = {
    tvl: sumTokensExport({ chain, tokens, owners: holders })
  }
})
