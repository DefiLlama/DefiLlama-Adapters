const { sumTokens2, } = require("../helper/unwrapLPs")
const { covalentGetTokens, } = require("../helper/http")
const { getChainTransform } = require('../helper/portedTokens')
const { getUniqueAddresses } = require('../helper/utils')


const config = {
  ethereum: {
    holder: '0xA81bd16Aa6F6B25e66965A2f842e9C806c0AA11F',
    revest: '0x120a3879da835a5af037bb2d1456bebd6b54d4ba',
  },
  polygon: {
    holder: '0x3cCc20d960e185E863885913596b54ea666b2fe7',
  },
  fantom: {
    holder: '0x3923E7EdBcb3D0cE78087ac58273E732ffFb82cf',
  },
  avax: {
    holder: '0x955a88c27709a1EEf4ACa0df0712c67B48240919',
  },
}

module.exports = {
  hallmarks: [
    [1648339200, "Reentrancy attack"]
],
  methodology: "We list all tokens in our vault and sum them together",
};


Object.keys(config).forEach(chain => {
  const { holder, revest, graph, } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, { [chain]: block }, { api }) => {
      const blacklist = []
      if (revest) blacklist.push(revest.toLowerCase())
      let tokens = await covalentGetTokens(holder, api.chain)
      tokens = getUniqueAddresses(tokens).filter(t => !blacklist.includes(t)) // filter out staking and LP tokens
      return sumTokens2({ api, owner: holder, tokens, })
    },
  }

  if (revest)
    module.exports[chain].staking = async (_, _b, { [chain]: block }) => {
      const transform = await getChainTransform(chain)
      const balances = await sumTokens2({ chain, block, owner: holder, tokens: [revest] })
      if (!graph) return balances
      return queryGraph(graph, [revest], transform, balances)
    }
})

