const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')
const tronNull = 'T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb'

const config = {
  ethereum: { factory: '0x5ed3c9089ed0355bc77cf439dc2ed28c4054c8c4' },
  bsc: { factory: '0xEeFa8Ca24dd1D573882277b917720953e999734D' },
  csc: { factory: '0xEeFa8Ca24dd1D573882277b917720953e999734D' },
  tron: { factory: 'TTw6kcn7yGExHZRuJXNP2saq6xZ7oTHne4' },
}

Object.keys(config).forEach(chain => {
  const { factory } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const pairs = await api.fetchList({  lengthAbi: 'uint256:allPairsLength', itemAbi: 'function allPairs(uint256) view returns (address)', target: factory, permitFailure: true, })
      const data = await api.multiCall({  abi: 'function getTokensFromPair(address) view returns (address, address)', calls: pairs, target: factory})
      const ownerTokens = data.map((v, i) => [v.map(i => i === tronNull ? nullAddress : i), pairs[i]])
      return sumTokens2({ api, ownerTokens, blacklistedTokens: pairs})
    }
  }
})