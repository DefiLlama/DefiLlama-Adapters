const { get } = require('../helper/http')

async function tvl() {
  return {
    tether: (await get('https://vite-api.thomiz.dev/tvl/vitcswap')).tvl
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