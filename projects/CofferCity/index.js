const { config } = require('./config')
const abi = require('./abi.json')
const { sumUnknownTokens, } = require('../helper/unknownTokens')

module.exports = {
  methodology: 'Counts TVL of all the assets supported by the Coffer City smart contracts'
};

Object.values(config).forEach(({ chain, vault, startBlock }) => {
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const data = await api.fetchList({  lengthAbi: abi.getSupportedTokens, itemAbi: abi.getSupportedTokens, target: vault, startFromOne: true, })
      const tokensAndOwners = data
        .map((i) => [i.tokenAddress, vault])
      return sumUnknownTokens({ api, tokensAndOwners, useDefaultCoreAssets: true, resolveLP: false, })
    }
  }
})
