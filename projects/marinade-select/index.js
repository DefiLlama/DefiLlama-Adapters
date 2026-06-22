const ADDRESSES = require('../helper/coreAssets.json')
const { StakeProgram } = require('@solana/web3.js')
const { getConnection } = require('../helper/solana')
const { getCache, setCache } = require('../helper/cache')

const MARINADE_SELECT_STAKER = 'STNi1NHDUi6Hvibvonawgze8fM83PFLeJhuGMEXyGps'
const STAKER_OFFSET = 12
const DEACTIVATION_OFFSET = 172
const U64_MAX = 0xffffffffffffffffn

// RPC occasionally returns extra SA that increases sum by ~2.5x. Each fetch is compared 
// to the last value in cache; anything >50% above baseline is retried after RETRY_DELAY_MS.
const SPIKE_THRESHOLD_BPS = 5000n
const RETRY_ATTEMPTS = 3
const RETRY_DELAY_MS = 1000
// todo: remove once cache is set
const BASELINE = 1148868506938795n  // 1.1M SOL, 2026-06

async function fetchWithRetries(connection, cached) {
  const spikeCap = cached + (cached * SPIKE_THRESHOLD_BPS) / 10000n
  for (let attempt = 0; attempt < RETRY_ATTEMPTS; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, RETRY_DELAY_MS))
    try {
      const accts = await connection.getProgramAccounts(StakeProgram.programId, {
        filters: [{ memcmp: { bytes: MARINADE_SELECT_STAKER, offset: STAKER_OFFSET } }],
      })
      const seen = new Set()
      let active = 0n
      for (const { pubkey, account } of accts) {
        const key = pubkey.toBase58()
        if (seen.has(key)) continue
        seen.add(key)
        if (account.data.readBigUInt64LE(DEACTIVATION_OFFSET) === U64_MAX) {
          active += BigInt(account.lamports)
        }
      }
      if (active <= spikeCap) return active
    } catch (e) {}
  }
  return null
}

async function tvl(api) {
  const cache = await getCache('marinade-select', 'solana')
  const cached = (cache?.activeLamports ? BigInt(cache.activeLamports) : null) ?? BASELINE

  // todo: use instead once initial cache is set
  // const cached = cache?.activeLamports ? BigInt(cache.activeLamports) : null
  // if (!cached) throw new Error('marinade-select: missing reference cache')

  const balance = await fetchWithRetries(getConnection(), cached)
  if (balance === null) throw new Error(`marinade-select: ${RETRY_ATTEMPTS} attempts spiked or errored`)

  await setCache('marinade-select', 'solana', { activeLamports: balance.toString() })
  api.add(ADDRESSES.solana.SOL, balance.toString())
}

module.exports = {
  timetravel: false,
  solana: { tvl },
  methodology: 'We sum the amount of SOL staked by account STNi1NHDUi6Hvibvonawgze8fM83PFLeJhuGMEXyGps.',
}