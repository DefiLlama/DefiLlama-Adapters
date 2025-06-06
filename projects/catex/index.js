const { get } = require('../helper/http')

const STRATEGIES_URL = 'https://raw.githubusercontent.com/Lynexfi/lynex-lists/main/strategies/main.json'

async function getCatexPools(chainId) {
  const data = await get(STRATEGIES_URL)
  const strategies = data[chainId] || []
  return strategies
    .filter(strategy => strategy.variant === 'uniV4')
    .map(strategy => strategy.address)
}

async function tvlForChain(api, chainId) {
  const CATEX_POOLS = await getCatexPools(chainId)
  if (!CATEX_POOLS.length) return {}

  const token0s = await api.multiCall({ abi: 'address:token0', calls: CATEX_POOLS })
  const token1s = await api.multiCall({ abi: 'address:token1', calls: CATEX_POOLS })
  const totalAmounts = await api.multiCall({
    abi: 'function getTotalAmounts() view returns (uint256 total0, uint256 total1, uint256 totalFee0, uint256 totalFee1)',
    calls: CATEX_POOLS,
  })

  totalAmounts.forEach((amounts, i) => {
    api.add(token0s[i], amounts.total0)
    api.add(token1s[i], amounts.total1)
  })

  return api.getBalances()
}

module.exports = {
  methodology: 'TVL counts the tokens locked in ALM vaults that Catex manages on top of Uniswap V4',
  start: 69453847,
  polygon: { tvl: (api) => tvlForChain(api, '137') },
  unichain: { tvl: (api) => tvlForChain(api, '130') },
  hallmarks: [
    [1748451600, "Catex migrated from Polygon to Unichain"],
  ],
} 