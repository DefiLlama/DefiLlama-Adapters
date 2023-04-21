const { config } = require('./config')
const abi = require('./abi.json')
const { sumUnknownTokens, } = require('../helper/unknownTokens')

module.exports = {
};

Object.values(config).forEach(({ chain, locker, startBlock }) => {
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const length = await api.call({  abi: abi.depositId, target: locker})
      const calls = []
      for (let i = 0;i <=length;i++) calls.push(i)
      const data = await api.multiCall({  abi: abi.lockedToken, calls, target: locker, })
      const tokensAndOwners = data
        // .filter(i => !i.withdrawn)
        .map((i) => [i.tokenAddress, locker])
      return sumUnknownTokens({ api, tokensAndOwners, useDefaultCoreAssets: true, resolveLP: true, })
    }
  }
})