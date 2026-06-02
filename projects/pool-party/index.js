const { get } = require('../helper/http')

const POOLS_URL = 'https://api.cctools.network/api/markets/send/pools'

// const parties = [
//   'mainnet-pool-party-amulet-cusd-operator::1220724bbd5179d9f5d19de90f31cfa0e99e4bf9cf815e3e5e669a40524725d9e98b',
//   'mainnet-pool-party-amulet-usdcx-operator::1220647009424eff86ef09493a366aa314e8533c0cd8070aa82a9b014e42daad03c3',
// ]

// CCTools rejects axios's default User-Agent; identify ourselves explicitly.
const FETCH_OPTS = { headers: { 'User-Agent': 'DefiLlama-Adapter (pool-party)' } }

async function tvl(api) {
  const pools = await get(POOLS_URL, FETCH_OPTS)
  for (const pool of pools) {
    if (pool.status !== 'live') continue
    for (const side of [pool.baseReserve, pool.quoteReserve]) {
      const m = side.tokenId == 'Amulet' ? 1e18 : 1e6
      api.add(side.tokenId, Number(side.amount) * m)
    }
  }
}

module.exports = {
  timetravel: false,
  canton: { tvl },
  methodology:
    "Sum of raw token reserves across Pool Party's live pools (CC/USDCx, " +
    "CC/CUSD, CUSD/USDCx), via the CCTools API — an independent Canton DeFi " +
    "aggregator that exposes per-pool reserves with canonical token IDs."
}
