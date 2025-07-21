const abi = {
  getTokensForBorrowingArray: "function getTokensForBorrowingArray() view returns ((address tokenAddress, uint256 LTV, uint256 rate, string name, uint256 liquidationThreshold)[])",
  getTotalTokenBorrowed: "function getTotalTokenBorrowed(address tokenAddress) view returns (uint256)",
  getTokensForLendingArray: "function getTokensForLendingArray() view returns ((address tokenAddress, uint256 LTV, uint256 rate, string name, uint256 liquidationThreshold)[])",
  getTotalTokenSupplied: "function getTotalTokenSupplied(address tokenAddress) view returns (uint256)",
}

const config = {
  plume: { pool: '0x8bd47bC14f38840820d1DC7eD5Eb57b85d2c7808' },
  plume_mainnet: { pool: '0x3AF7D19aAeCf142C91FF1A8575A316807a0f611A' },
}

async function getTokens(api, pool) {
  const tokenBorrowed = await api.call({ abi: abi.getTokensForBorrowingArray, target: pool })
  const tokenLending = await api.call({ abi: abi.getTokensForLendingArray, target: pool })
  return [...new Set(tokenLending.concat(tokenBorrowed).map(log => log.tokenAddress))]
}

const tvl = async (api) => {
  const { pool } = config[api.chain]
  const tokens = await getTokens(api, pool)
  return api.sumTokens({ owner: pool, tokens })
}

const borrowed = async (api) =>  {
  const { pool } = config[api.chain]
  const tokens = await getTokens(api, pool)
  const bals = await api.multiCall({ abi: abi.getTotalTokenBorrowed, calls: tokens, target: pool })
  api.add(tokens, bals)
}

Object.entries(config).forEach(([chain]) => {
  module.exports[chain] = chain === 'plume' ? { tvl: () => ({}) } : { tvl, borrowed }
});