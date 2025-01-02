const { get } = require('./helper/http')

async function tvl({ timestamp }) {
  const ONE_DAY_AGO = timestamp - 24 * 60 * 60
  const data = await get('https://api.flamingo.finance/analytics/pool-stats?mainnet=true');
  return {
    tether: data.totals
      .filter(i => i.t > ONE_DAY_AGO)
      .sort((a, b) => b.t - a.t)[0].lq
  }
}

module.exports = {
  hallmarks: [
    [1638525600, "N3 migration start"],
    [1641117600, "100% minting on N3"],
    [1641808800, "First IDO"],
    [1648116000, "First reverse pool"],
    [1650276000, "Binance N3 support"],
    [1651140000, "FLUND single stake"],
    [1656410400, "Mobile App"]
  ],
  methodology: `TVL is obtained by making calls to the Flamingo Finance API "https://api.flamingo.finance/token-info/tvl".`,
  misrepresentedTokens: true,
  timetravel: false,
  neo: {
    tvl
  }
}
