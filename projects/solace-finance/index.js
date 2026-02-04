const { sumTokens2 } = require('../helper/unwrapLPs')
const config = require('./config')

module.exports = {}

function setChainTVL(chain) {
  const { lp, uwp_address, tokens, solace, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => api.sumTokens({ tokens, owner: uwp_address})
  }
  if (lp)
    module.exports[chain].pool2 = (api) => sumTokens2({ api,  tokens: [lp], owner: uwp_address, resolveLP: true})

  if (solace)
    module.exports[chain].staking = (api) => sumTokens2({ api,  tokens: [solace], owner: uwp_address})
}

Object.keys(config).forEach(setChainTVL)
