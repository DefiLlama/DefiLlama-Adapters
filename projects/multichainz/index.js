const abi = {
  "getTokensForBorrowingArray": "function getTokensForBorrowingArray() view returns ((address tokenAddress, uint256 LTV, uint256 stableRate, string name, uint256 liquidationThreshold)[])",
  "getTokensForLendingArray": "function getTokensForLendingArray() view returns ((address tokenAddress, uint256 LTV, uint256 stableRate, string name, uint256 liquidationThreshold)[])",
  "getTotalTokenBorrowed": "function getTotalTokenBorrowed(address tokenAddress) view returns (uint256)",
}

const config = {
  plume: { pool: '0x8bd47bC14f38840820d1DC7eD5Eb57b85d2c7808', },
}

Object.keys(config).forEach(chain => {
  const { pool } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const tokens = await getTokens(api)
      return api.sumTokens({ owner: pool, tokens })
    },
    borrowed: async (api) => {
      const tokens = await getTokens(api)
      const bals = await api.multiCall({ abi: abi.getTotalTokenBorrowed, calls: tokens, target: pool })
      api.add(tokens, bals)
    }
  }

  async function getTokens(api) {
    const tokenBorrowed = await api.call({ abi: abi.getTokensForBorrowingArray, target: pool })
    const tokenLending = await api.call({ abi: abi.getTokensForBorrowingArray, target: pool })
    return [...new Set(tokenLending.concat(tokenBorrowed).map(log => log.tokenAddress))]
  }
})