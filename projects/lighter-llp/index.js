const { get } = require('../helper/http')

async function tvl(api) {
  const timestamp = Math.floor(api.timestamp / 86400) * 86400
  const { code, resolution, pnl } = await get('https://mainnet.zklighter.elliot.ai/api/v2/pnl', {
    params: {
      by: 'index',
      value: '281474976710654',
      resolution: '1d',
      start_timestamp: timestamp - 86400,
      end_timestamp: timestamp,
    },
  })
  const snapshot = Array.isArray(pnl) && pnl.find(point => point.timestamp === timestamp && point.is_final === true)
  if (code !== 200 || resolution !== '1d' || !snapshot || !Number.isFinite(snapshot.total_equity) || snapshot.total_equity < 0)
    throw new Error(`Missing or invalid Lighter LLP daily equity for ${timestamp}`)
  api.addUSDValue(snapshot.total_equity)
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  start: '2025-01-18',
  doublecounted: true,
  methodology: 'LLP total equity, including spot assets, from Lighter’s official API at the latest completed UTC-day boundary. Backing assets are also counted by Lighter Bridge.',
  zklighter: { tvl },
}
