const { sumTokens2 } = require('../helper/unwrapLPs')
const { get } = require('../helper/http')

const STRATEGIES_URL = 'https://raw.githubusercontent.com/Lynexfi/lynex-lists/main/strategies/main.json'

async function getCatexPools() {
  const data = await get(STRATEGIES_URL)
  // Get only Polygon (137) strategies
  const polygonStrategies = data['137'] || []
  // Filter for uniV4 strategies only since Catex only manages V4 pools
  return polygonStrategies
    .filter(strategy => strategy.variant === 'uniV4')
    .map(strategy => strategy.address)
}

module.exports = {
  methodology: 'TVL counts the tokens locked in Gamma ALM vaults that Catex manages on top of Uniswap V4',
  start: 69453847,
  polygon: {
    tvl: async (api) => {
      const CATEX_POOLS = await getCatexPools()
      
      // Get token addresses for each vault
      const token0s = await api.multiCall({ abi: 'address:token0', calls: CATEX_POOLS })
      const token1s = await api.multiCall({ abi: 'address:token1', calls: CATEX_POOLS })
      
      // Get total amounts including fees for each vault
      const totalAmounts = await api.multiCall({ 
        abi: 'function getTotalAmounts() view returns (uint256 total0, uint256 total1, uint256 totalFee0, uint256 totalFee1)',
        calls: CATEX_POOLS 
      })
      
      // Add balances for each vault
      totalAmounts.forEach((amounts, i) => {
        // Add token0 total (including fees)
        api.add(token0s[i], amounts.total0)
        // Add token1 total (including fees)
        api.add(token1s[i], amounts.total1)
      })
      
      return api.getBalances()
    }
  }
} 