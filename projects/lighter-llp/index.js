const { get } = require('../helper/http')

const DAY = 86400
const LLP_ACCOUNT_INDEX = '281474976710654'

async function tvl(api) {
  const timestamp = Math.floor(api.timestamp / DAY) * DAY
  const data = await get('https://mainnet.zklighter.elliot.ai/api/v2/pnl', {
    params: {
      by: 'index',
      value: LLP_ACCOUNT_INDEX,
      resolution: '1d',
      start_timestamp: timestamp - DAY,
      end_timestamp: timestamp,
    },
  })
  if (data.code !== 200 || data.resolution !== '1d' || !Array.isArray(data.pnl))
    throw new Error('Invalid Lighter LLP equity response')

  const snapshot = data.pnl.find(point => point.timestamp === timestamp && point.is_final === true)
  if (!snapshot)
    throw new Error(`Missing completed Lighter LLP equity snapshot for ${timestamp}`)

  const equity = snapshot.total_equity
  if (!['number', 'string'].includes(typeof equity) || String(equity).trim() === '' || !Number.isFinite(Number(equity)) || Number(equity) < 0)
    throw new Error(`Invalid Lighter LLP total equity for ${timestamp}`)

  api.addUSDValue(equity)
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  start: '2025-01-18',
  doublecounted: true,
  methodology: 'Lighter LLP total equity (including spot assets) from the official v2 PnL API for account 281474976710654. Uses the completed UTC-day snapshot at or before the requested timestamp; missing snapshots fail rather than falling back to current equity. Assets are also held in the rollup contracts tracked by Lighter Bridge.',
  zklighter: { tvl },
}
