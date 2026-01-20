const { get } = require('../helper/http')

async function tvl() {
  const data = await get('https://vite-info-api.xvite.workers.dev/')
  return {
    tether: data.tvlRankings.filter(i => i.name == 'ViteX')[0].amount
  }
}

module.exports = {
  deadFrom: "2025-03-01",
  timetravel: false,
  misrepresentedTokens: true,
  vite:{
    tvl
  },
}