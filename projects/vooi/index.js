const config = require("./config");
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  methodology: 'Counts the amount of assets locked in VOOI pools',
  hallmarks: [
    [1692921600,"DWF Labs Depo 1.5m$"]
  ],
};

config.chains.forEach(chainInfo => {
  const {name: chain, tokens, holders} = chainInfo
  module.exports[chain] = {
    tvl: sumTokensExport({ tokens, owners: holders })
  }
})
