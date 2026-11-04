const { get } = require('../helper/http')

// Brighter's Ethereum contracts hold no USDC or LIT: deposits are bridged to Lighter, where the
// protocol's 2-of-3 Safe (owner of all Brighter contracts) holds them as LLP shares (USDb side)
// and LIT staking (sLITb side). TVL is read from those Lighter accounts directly.
const SAFE = '0xb582Aa48eb9d0BD58E16DD4E98637161310be280'
const API = 'https://mainnet.zklighter.elliot.ai/api'

async function tvl(api) {
  const timestamp = Math.floor(api.timestamp / 86400) * 86400
  const { sub_accounts } = await get(`${API}/v1/accountsByL1Address`, { params: { l1_address: SAFE } })
  if (!Array.isArray(sub_accounts) || !sub_accounts.length) throw new Error('No Lighter accounts found for the Brighter Safe')

  for (const { index } of sub_accounts) {
    const { code, resolution, pnl } = await get(`${API}/v2/pnl`, {
      params: { by: 'index', value: index, resolution: '1d', start_timestamp: timestamp - 86400, end_timestamp: timestamp },
    })
    const snapshot = Array.isArray(pnl) && pnl.find(point => point.timestamp === timestamp && point.is_final === true)
    if (code !== 200 || resolution !== '1d' || !snapshot || !Number.isFinite(snapshot.total_equity) || snapshot.total_equity < 0)
      throw new Error(`Missing or invalid Lighter daily equity for account ${index} at ${timestamp}`)
    // total_equity = trade_equity (spot/margin collateral) + pool_equity (LLP shares) + staking_equity (staked LIT)
    api.addUSDValue(snapshot.total_equity)
  }
}

module.exports = {
  misrepresentedTokens: true,
  doublecounted: true,
  start: '2026-09-29',
  methodology: 'Equity of the Lighter accounts held by the Brighter Safe, from Lighter’s official API at the latest completed UTC-day boundary: LLP shares backing USDb, staked LIT backing sLITb, and spot collateral, in USD. Brighter’s Ethereum contracts hold no deposits; they are bridged to Lighter, so this overlaps with Lighter LLP.',
  zklighter: { tvl },
}
