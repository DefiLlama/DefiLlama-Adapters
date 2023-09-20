const contract = '0xF80E51AFb613D764FA61751Affd3313C190A86BB'

const CHAINS = ["ethereum", "bsc", "polygon", "arbitrum", "avax", "optimism", "fantom"]
const chainPathsAbi = "function chainPaths(uint256) view returns (bool ready, address srcToken, uint16 dstChainId, address dstToken, uint256 remoteLiquidity, uint256 localLiquidity, uint256 rewardPoolSize, address lpToken, bool stopSwap)"

CHAINS.forEach(chain => {
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const tokens = []
      let hasMoreTokens = false
      let currentStart = 0
      const fetchSize = 5
      do {
        let res = await api.fetchList({  itemAbi: chainPathsAbi, target: contract, itemCount: fetchSize + currentStart, start: currentStart, permitFailure: true})
        res = res.filter(i => i).map(i => i.srcToken)
        tokens.push(...res)
        currentStart += fetchSize
        hasMoreTokens = res.length === fetchSize
      } while (hasMoreTokens)
      return api.sumTokens({ owner: contract, tokens })
    }
  }
})

module.exports.methodology = "Fetches the localLiquidity of each token in the Altitude contract across multiple chains and computes the TVL."
