const { get } = require('../helper/http')

const DEFINDEX_API_BASE_URL = 'https://api.defindex.io'
const DAY_ONE = 1748518054

async function tvl(api) {
  const data = await get(`${DEFINDEX_API_BASE_URL}/tvl?timestamp=${api.timestamp}&network=mainnet`)
  for (const [assetId, amount] of Object.entries(data.tvl)) {
    api.add(assetId, amount)
  }
}

module.exports = {
  timetravel: true,
  start: DAY_ONE,
  methodology: 'TVL is the sum of all assets managed by DeFindex vaults on Stellar, reconstructed from on-chain indexed events.',
  stellar: { tvl },
}
