const { get } = require('../helper/http')

const STRATEGIES_URL = 'https://raw.githubusercontent.com/alma-labs/hydrex-lists/main/strategies/8453.json'

async function getHydrexUniv4Pools() {
  const data = await get(STRATEGIES_URL)
  return data
    .filter(strategy => strategy.liquidityType === 'uniV4')
    .map(strategy => strategy.address)
}

async function tvlForChain(api) {
  const HYDREX_POOLS = await getHydrexUniv4Pools()
  if (!HYDREX_POOLS.length) return {}

  const token0s = await api.multiCall({ abi: 'address:token0', calls: HYDREX_POOLS })
  const token1s = await api.multiCall({ abi: 'address:token1', calls: HYDREX_POOLS })
  const totalAmounts = await api.multiCall({
    abi: 'function getTotalAmounts() view returns (uint256 total0, uint256 total1, uint256 totalFee0, uint256 totalFee1)',
    calls: HYDREX_POOLS,
  })

  totalAmounts.forEach((amounts, i) => {
    api.add(token0s[i], amounts.total0)
    api.add(token1s[i], amounts.total1)
  })

  return api.getBalances()
}

module.exports = {
  methodology: 'TVL counts the tokens locked in ALM vaults that Hydrex manages on top of Uniswap V4',
  doublecounted: true,
  start: '2025-06-17',
  base: { tvl: (api) => tvlForChain(api) },
} 