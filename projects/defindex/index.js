const { get } = require('../helper/http')

const DEFINDEX_API_BASE_URL = 'https://api.defindex.io'
const DAY_ONE = 1748518054

async function tvl(api) {
  const url = api.timestamp ? `${DEFINDEX_API_BASE_URL}/tvl?timestamp=${api.timestamp}` : `${DEFINDEX_API_BASE_URL}/tvl`
  try {
    const data = await get(url)
    for (const [assetId, amount] of Object.entries(data.tvl)) {
    api.add(assetId, amount)
    }
  } catch (error) {
    console.error('Error fetching DeFindex TVL:', error)
  }
}

module.exports = {
  timetravel: true,
  start: DAY_ONE,
  methodology: 'TVL is the sum of all assets managed by DeFindex vaults on Stellar, reconstructed from on-chain indexed events.',
  stellar: { tvl },
}
