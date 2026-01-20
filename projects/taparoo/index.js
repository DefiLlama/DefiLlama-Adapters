const { get } = require('../helper/http')

module.exports = {
  misrepresentedTokens: true,
  icp: { tvl },
}

async function tvl(api) {
  let response = await get('https://ic0.app/api/v2/canister/5ez4n-ayaaa-aaaah-qdqua-cai/query/getTvl')
  const satoshiAmount = parseInt(response.replace(/"/g, ''))
  const btcAmount = satoshiAmount / 100000000
  api.add('bitcoin', btcAmount)
}
