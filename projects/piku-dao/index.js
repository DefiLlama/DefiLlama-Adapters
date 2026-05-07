const ADDRESSES = require('../helper/coreAssets.json')

const USP_TOKEN = '0x098697bA3Fee4eA76294C5d6A466a4e3b3E95FE6'
const ORACLE = '0x433471901bA1A8BDE764E8421790C7D9bAB33552'

async function tvl(api) {
  // Get USP total supply and oracle price in parallel
  const [totalSupply, decimals, pricePerToken] = await Promise.all([
    api.call({ target: USP_TOKEN, abi: 'erc20:totalSupply' }),
    api.call({ target: USP_TOKEN, abi: 'uint256:decimals' }),
    api.call({ target: ORACLE, abi: 'function getPriceForIssuance() view returns (uint256)' })
  ])

  // Calculate TVL in USDC
  // totalSupply is in 18 decimals, pricePerToken is in 6 decimals (USDC format)
  // Result should be in USDC's 6 decimals
  // Formula: (totalSupply * price) / 10^18 = TVL in USDC (6 decimals)
  const tvlInUsdc = (totalSupply * pricePerToken) / (10 ** decimals)

  // Report as USDC for proper USD valuation
  api.add(ADDRESSES.ethereum.USDC, tvlInUsdc)
}

module.exports = {
  methodology: "TVL is calculated by multiplying USP stablecoin's total supply with its oracle price (getPriceForIssuance). The oracle price is manually updated and reflects the yield-bearing value of USP backed by USDC.",
  start: 23081800,
  timetravel: true,
  misrepresentedTokens: false,
  ethereum: {
    tvl,
  }
}
