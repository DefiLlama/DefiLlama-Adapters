const { get } = require('../helper/http')

const STRATEGIES_URL = 'https://api.hydrex.fi/strategies'

async function getStrategies() {
  const data = await get(STRATEGIES_URL)
  
  const univ4Pools = data
    .filter(strategy => strategy.liquidityType === 'uniV4')
    .map(strategy => strategy.address)
  
  const morphoStrategies = data
    .filter(strategy => strategy.liquidityType === 'morpho')
    .map(strategy => ({
      gauge: strategy.gauge.address,
      vault: strategy.address,
    }))
  
  const eulerStrategies = data
    .filter(strategy => strategy.liquidityType === 'euler')
    .map(strategy => ({
      gauge: strategy.gauge.address,
      vault: strategy.address,
    }))
  
  return { univ4Pools, morphoStrategies, eulerStrategies }
}

async function tvlForChain(api) {
  const { univ4Pools, morphoStrategies, eulerStrategies } = await getStrategies()

  // UniV4 TVL
  if (univ4Pools.length) {
    const token0s = await api.multiCall({ abi: 'address:token0', calls: univ4Pools })
    const token1s = await api.multiCall({ abi: 'address:token1', calls: univ4Pools })
    const totalAmounts = await api.multiCall({
      abi: 'function getTotalAmounts() view returns (uint256 total0, uint256 total1, uint256 totalFee0, uint256 totalFee1)',
      calls: univ4Pools,
    })

    totalAmounts.forEach((amounts, i) => {
      api.add(token0s[i], amounts.total0)
      api.add(token1s[i], amounts.total1)
    })
  }

  // Morpho TVL
  if (morphoStrategies.length) {
    const depositAssets = await api.multiCall({ 
      abi: 'address:asset', 
      calls: morphoStrategies.map(s => s.vault) 
    })

    const balanceOfReceipts = await api.multiCall({
      abi: 'erc20:balanceOf',
      calls: morphoStrategies.map(s => ({ target: s.vault, params: [s.gauge] })),
    })

    const balances = await api.multiCall({
      abi: 'function convertToAssets(uint256 shares) view returns (uint256)',
      calls: morphoStrategies.map((s, i) => ({ target: s.vault, params: [balanceOfReceipts[i]] })),
    })

    balances.forEach((balance, i) => {
      api.add(depositAssets[i], balance)
    })
  }

  // Euler TVL
  if (eulerStrategies.length) {
    const depositAssets = await api.multiCall({ 
      abi: 'address:asset', 
      calls: eulerStrategies.map(s => s.vault) 
    })

    const balanceOfReceipts = await api.multiCall({
      abi: 'erc20:balanceOf',
      calls: eulerStrategies.map(s => ({ target: s.vault, params: [s.gauge] })),
    })

    const balances = await api.multiCall({
      abi: 'function convertToAssets(uint256 shares) view returns (uint256)',
      calls: eulerStrategies.map((s, i) => ({ target: s.vault, params: [balanceOfReceipts[i]] })),
    })

    balances.forEach((balance, i) => {
      api.add(depositAssets[i], balance)
    })
  }

  return api.getBalances()
}

module.exports = {
  methodology: 'TVL counts the tokens locked in ALM vaults & forwarded deposits that Hydrex manages on top of multiple protocols, such as UniV4, Morpho, and Euler.',
  doublecounted: true,
  start: '2025-06-17',
  base: { tvl: (api) => tvlForChain(api) },
} 