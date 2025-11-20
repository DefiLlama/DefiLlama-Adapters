const { getConfig } = require('../helper/cache')

async function tvl() {
  const { data } = await getConfig('sega-solana', 'https://api-sol.sega.so/api/main/info')
  
  return {
    tether: data.tvl
  }
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
  },
}
