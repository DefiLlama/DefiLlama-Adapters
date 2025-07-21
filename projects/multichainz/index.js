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
  // Note: This counts all tokens held by the pool contract
  // For lending protocols, this includes both supplied and borrowed amounts
  // DefiLlama will automatically subtract borrowed amounts when both tvl and borrowed functions are exported
  return api.sumTokens({ owner: pool, tokens })
}

const borrowed = async (api) =>  {
  const { pool } = config[api.chain]
  const tokens = await getTokens(api, pool)
  const bals = await api.multiCall({ abi: abi.getTotalTokenBorrowed, calls: tokens, target: pool })
  api.add(tokens, bals)
}

module.exports.methodology = "Counts the tokens locked in the multichainz pool contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. The TVL calculation includes all tokens held by the pool contract, and DefiLlama automatically subtracts borrowed amounts to show available liquidity."
Object.entries(config).forEach(([chain]) => {
  // Deprecated chain, set borrowed to 0
  module.exports[chain] = chain === 'plume' ? { tvl: () => ({}) } : { tvl, borrowed }
});
