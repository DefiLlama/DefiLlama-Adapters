const { get } = require('../helper/http')
const { transformBalances } = require('../helper/portedTokens')

async function tvl() {
  const resp = await get('https://connect.tonhubapi.com/stats/staking')
  return transformBalances('ton', {
    // 'USD': resp.tvlUsd,
    'Ef8zMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzM0vF': resp.tvlTon
  });
}

module.exports = {
  timetravel: false,
  ton: {
    tvl
  }
}
