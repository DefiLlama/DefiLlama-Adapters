const { get } = require('../helper/http')

const METEORA_API = 'https://dammv2-api.meteora.ag'

// https://docs.meteora.ag/api-reference/damm-v2/overview
async function tvl() {
  const { data } = await get(`${METEORA_API}/pools/global-metrics`)

  // Return TVL as object with USD value
  return {
    tether: data.tvl24h, // Using tvl24h which represents current TVL
  }
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is calculated using the Meteora DAMM v2 API global metrics endpoint',
  solana: { tvl, },
}
