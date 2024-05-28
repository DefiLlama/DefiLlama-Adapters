const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  btr: { pairInfo: '0xb6d73e9a9cf70ddf396afcd677fdafe7073aa026' },
}

Object.keys(config).forEach(chain => {
  const { pairInfo } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      let pairs = []
      let hasMore = true
      let length = 999
      let offset = 0
      do {
        const { pagePairs, } = await api.call({ abi: 'function fetchPairsAddressListPaginate(uint256 start, uint256 end) view returns (address[] pagePairs, uint256 pairCount)', target: pairInfo, params: [offset, length] })
        pairs = pairs.concat(pagePairs)
        offset += length
        hasMore = pagePairs.length === length
      } while (hasMore)
      const tokenXs = await api.multiCall({ abi: 'address:xToken', calls: pairs })
      const tokenYs = await api.multiCall({ abi: 'address:yToken', calls: pairs })
      const tokensAndOwners2 = [tokenXs.concat(tokenYs), pairs.concat(pairs)]
      return sumTokens2({ tokensAndOwners2, api })
    }
  }
})