const ADDRS = [
  'bc1pc5regkaavr8nwk3tt72snnnyj56shc4ss4xn7y60u6mh88vcp03qmg2p2q',
]

const BASE = 'https://blockstream.info/api'

async function getConfirmedSats(addr) {
  const r = await fetch(`${BASE}/address/${addr}`)
  if (!r.ok) throw new Error(`HTTP ${r.status} for ${addr}`)
  const j = await r.json()
  const funded = BigInt(j?.chain_stats?.funded_txo_sum ?? 0)
  const spent  = BigInt(j?.chain_stats?.spent_txo_sum  ?? 0)
  
  return funded - spent
}

async function tvl() {
  const satsList = await Promise.all(ADDRS.map(getConfirmedSats))
  const totalSats = satsList.reduce((a, b) => a + b, 0n)

  return { 'coingecko:bitcoin': Number(totalSats) }
}

module.exports = {
  timetravel: false,
  methodology: 'Sum of confirmed native BTC held by bridge custody addresses on Bitcoin.',
  bitcoin: { tvl },
}
