const config = require("./config");
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  methodology: 'Counts the amount of assets locked in VOOI pools',
};

config.chains.forEach(chainInfo => {
  const {name: chain, tokens, holders} = chainInfo
  module.exports[chain] = {
    tvl: sumTokensExport({ tokens, owners: holders })
  }
})
