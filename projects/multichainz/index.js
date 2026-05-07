const ADDRESSES = require('../helper/coreAssets.json')

const abi = {
  getTokensForBorrowingArray: "function getTokensForBorrowingArray() view returns ((address tokenAddress, uint256 LTV, uint256 rate, string name, uint256 liquidationThreshold)[])",
  getTotalTokenBorrowed: "function getTotalTokenBorrowed(address tokenAddress) view returns (uint256)",
  getTokensForLendingArray: "function getTokensForLendingArray() view returns ((address tokenAddress, uint256 LTV, uint256 rate, string name, uint256 liquidationThreshold)[])",
  getTotalTokenSupplied: "function getTotalTokenSupplied(address tokenAddress) view returns (uint256)",
  getTotalEthValue: "function getTotalEthValue() view returns (uint256)"
}

const config = {
   plume: { pool: '0x8bd47bC14f38840820d1DC7eD5Eb57b85d2c7808', deprecated: true },
  plume_mainnet: { pool: '0x3AF7D19aAeCf142C91FF1A8575A316807a0f611A' },
  ethereum: { pool: '0xf0523452484491515686936bEb976B41a45fD3a9', isStakingPool: true },
  arbitrum: {pool: '0x0a01b006c471032b3ec816ede297c05c4459d6c7'},
  base: {pool: '0xD2E1d1bBbC963DE56F27C4c078f9622F7a723601'}
  
}

async function getTokens(api, pool) {
 if(pool == config.ethereum.pool){

  const totalStaked = await api.call({ abi: abi.getTotalEthValue, target: pool })

  return { [ADDRESSES.ethereum.WETH]: totalStaked }

 }else{
   const tokenBorrowed = await api.call({ abi: abi.getTokensForBorrowingArray, target: pool })
  const tokenLending = await api.call({ abi: abi.getTokensForLendingArray, target: pool })
  return [...new Set(tokenLending.concat(tokenBorrowed).map(log => log.tokenAddress))]
 }
}

const tvl = async (api) => {
  const chainConfig = config[api.chain]
  if (!chainConfig || chainConfig.deprecated) return {}

   const { pool: poolAddress, isStakingPool } = chainConfig

  const tokens = await getTokens(api, poolAddress)
  // Note: This counts all tokens held by the pool contract
  // For lending protocols, this includes both supplied and borrowed amounts
  // DefiLlama will automatically subtract borrowed amounts when both tvl and borrowed functions are exported

   if (isStakingPool) {
    // For Ethereum staking pool, tokens is an object with ETH balance
    return tokens
  }

  return api.sumTokens({ owner: poolAddress, tokens })
}



const borrowed = async (api) =>  {
  const { pool } = config[api.chain]
  const tokens = (await getTokens(api, pool)).filter(addr => addr.toLowerCase() !== ADDRESSES.null)
  
  // For plume_mainnet, avoid multiCall due to Multicall3 issues
  if (api.chain === 'plume_mainnet') {
    // Make individual calls instead of multiCall
    for (const token of tokens) {
      const bal = await api.call({ abi: abi.getTotalTokenBorrowed, target: pool, params: [token] })
      api.add(token, bal)
    }
  } else {
    const bals = await api.multiCall({ abi: abi.getTotalTokenBorrowed, calls: tokens, target: pool })
    api.add(tokens, bals)
  }
}

module.exports.methodology = "Counts the tokens locked in the multichainz pool contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. The TVL calculation includes all tokens held by the pool contract, and DefiLlama automatically subtracts borrowed amounts to show available liquidity."
Object.entries(config).forEach(([chain, { deprecated, isStakingPool }]) => {
  module.exports[chain] = deprecated
    ? { tvl: () => ({}), borrowed: () => ({}) }
    : isStakingPool ? {tvl} :  { tvl, borrowed }
})

