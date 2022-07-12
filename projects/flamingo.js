const { get } = require('./helper/http')

async function tvl(timestamp) {
  const ONE_DAY_AGO = timestamp - 24 * 60 * 60
  const data = await get('https://api.flamingo.finance/analytics/pool-stats?mainnet=true');
  return {
    tether: data.totals
      .filter(i => i.t > ONE_DAY_AGO)
      .sort((a, b) => b.t - a.t)[0].lq
  }
}

module.exports = {
  methodology: `TVL is obtained by making calls to the Flamingo Finance API "https://api.flamingo.finance/token-info/tvl".`,
  misrepresentedTokens: true,
  timetravel: false,
  neo: {
    tvl
  }
}
