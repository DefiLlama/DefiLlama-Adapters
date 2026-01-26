const config = require("./config");
const { sumTokensExport } = require('../helper/unwrapLPs')
const { sumTokensExport: sumTon } = require('../helper/chain/ton')

module.exports = {
  methodology: 'Counts the amount of stables locked in Symbiosis protocol contracts: Portals V2',
};

config.chains.forEach(chainInfo => {
  const {name: chain, tokens, holders} = chainInfo

  if (chain === 'ton') {
    module.exports[chain] = {
      tvl: sumTon({ chain, tokens, owners: holders })
    }
  } else {
    module.exports[chain] = {
      tvl: sumTokensExport({ chain, tokens, owners: holders })
    }
  }
})

const deprecatedChains = ['aurora', 'boba_avax']
deprecatedChains.forEach(chain => {
  module.exports[chain] = {
    tvl: () => ({})
  }
})