const kodiakIslandFactory = '0x5261c5A5f08818c08Ed0Eb036d9575bA1E02c1d6'

const abis = {
    token0: 'address:token0',
    token1: 'address:token1',
    getDeployers: 'address[]:getDeployers',
    getIslands: 'function getIslands(address deployer) view returns (address[])',
    getUnderlyingBalances: 'function getUnderlyingBalances() view returns (uint256 amount0Current, uint256 amount1Current)'
  }
  
  const tvl = async (api) => {
    const deployers = await api.call({ target: kodiakIslandFactory, abi: abis.getDeployers })
    const islands = (await api.multiCall({ calls: deployers.map((d) => ({ target: kodiakIslandFactory, params: [d] })), abi: abis.getIslands })).flat()
  
    const [token0s, token1s, balances] = await Promise.all([
      api.multiCall({ calls: islands, abi: abis.token0, permitFailure: true }),
      api.multiCall({ calls: islands, abi: abis.token1, permitFailure: true }),
      api.multiCall({ calls: islands, abi: abis.getUnderlyingBalances, permitFailure: true })
    ])
  
    islands.forEach((_, i) => {
      const token0 = token0s[i]
      const token1 = token1s[i]
      const balance = balances[i]
      if (!token0 || !token1 || !balance) return
      const { amount0Current, amount1Current } = balance
      api.add(token0, amount0Current)
      api.add(token1, amount1Current)
    })
  }

  module.exports = {
    methodology: "TVL from Kodiak Islands (automated liquidity manager V3 positions, wrapped in ERC20 token).",
    doublecounted: true,
    berachain: { tvl }
  }