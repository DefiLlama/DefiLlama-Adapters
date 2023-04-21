const { config } = require('./config')
const abi = require('./abi.json')
const { sumUnknownTokens, } = require('../helper/unknownTokens')

module.exports = {
};

Object.values(config).forEach(({ chain, locker, startBlock }) => {
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const data = await api.fetchList({ lengthAbi: abi.depositId, itemAbi: abi.lockedToken, target: locker })
      const tokensAndOwners = data
        // .filter(i => !i.withdrawn)
        .map((i) => [i.tokenAddress, locker])
      return sumUnknownTokens({ api, tokensAndOwners, useDefaultCoreAssets: true, resolveLP: true, })
    }
  }
})