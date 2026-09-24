const { get } = require('../helper/http')

// STRATO Odds runs binary YES/NO price markets on STRATO. Each Market contract
// holds the USDST backing its outstanding complete sets (1 YES + 1 NO = 1 USDST),
// including winning tokens not yet redeemed, and each open buy order escrows
// USDST in its own Bid contract. Sell orders escrow outcome tokens, which are
// claims on market collateral already counted here, so they are left out.
const USDST = '0x937efa7e3a77e20bbdbd7c0d32b6514f368c1010'

// Markets are short-lived (thousands so far) and nothing on-chain indexes the
// few that still hold funds, so candidate holders are read from Cirrus, the
// public read-only index of STRATO contract storage. Balances are read on-chain.
// Tables are prefixed with the identity that deploys STRATO Odds.
const CIRRUS = 'https://app.strato.nexus/cirrus/search/strato-predict-'
const PAGE = 1000

async function holders(table, filter) {
  const out = []
  for (let offset = 0; ; offset += PAGE) {
    const rows = await get(`${CIRRUS}${table}?${filter}&select=address&order=address&limit=${PAGE}&offset=${offset}`)
    if (!Array.isArray(rows)) throw new Error(`strato-odds: unexpected Cirrus response for ${table}`)
    out.push(...rows.map(r => '0x' + r.address))
    if (rows.length < PAGE) return out
  }
}

async function tvl(api) {
  const markets = await holders('Market', 'collateral=gt.0')
  const bids = await holders('Bid', 'escrowRemaining=gt.0')
  return api.sumTokens({ owners: [...markets, ...bids], tokens: [USDST] })
}

module.exports = {
  methodology:
    'USDST held by every STRATO Odds prediction market (the collateral behind outstanding YES/NO outcome tokens, including winning tokens awaiting redemption) plus USDST escrowed in open buy orders on the order book. Sell orders escrow outcome tokens, which are claims on market collateral already counted, so they are excluded. Markets and orders still holding funds are listed from Cirrus, the public index of STRATO contract storage, and their USDST balances are read on-chain.',
  timetravel: false,
  start: '2026-08-18',
  strato: { tvl },
}
