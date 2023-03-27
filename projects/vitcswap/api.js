const { get } = require('../helper/http')

async function tvl() {
  return {
    tether: (await get('https://vite-api.thomiz.dev/tvl/vitcswap')).tvl
  }
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  vite:{
    tvl
  },
}