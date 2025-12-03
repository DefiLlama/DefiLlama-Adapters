const { get } = require('../helper/http')

const INDEXER = 'https://app.neutron.org/api/indexer/v2/vaults'

// Browser-like headers to pass WAF checks
const HDRS = {
  Origin: 'https://app.neutron.org',
  Referer: 'https://app.neutron.org/super-vaults',
  Accept: 'application/json, text/plain, */*',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
}

async function fetchVaults() {
  // small retry loop to ride out transient 403s/CDN quirks
  let lastErr
  for (let i = 0; i < 3; i++) {
    try {
      const res = await get(INDEXER, { headers: HDRS })
      const rows = Array.isArray(res?.data) ? res.data : []
      if (rows.length) return rows
    } catch (e) {
      lastErr = e
      await new Promise(r => setTimeout(r, 500 * (i + 1)))
    }
  } 
  throw lastErr || new Error('Indexer fetch failed')
}

async function tvl(api) {
  const rows = await fetchVaults()

  for (const v of rows) {
    if (!v || v.paused) continue
    // skip test/inactive vaults (deposit_cap = 0)
    if (!v.deposit_cap || v.deposit_cap === '0' || v.deposit_cap === 0) continue

    const a0 = v.amount_0
    const a1 = v.amount_1
    const d0 = v.token_0_denom
    const d1 = v.token_1_denom

    if (d0 && a0 && a0 !== '0') {
      api.add(d0, a0)
    }
    if (d1 && a1 && a1 !== '0') {
      api.add(d1, a1)
    }
  }
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,  // Bitcoin LSTs need pricing mappings
  methodology:
    'Sums token balances from Supervaults indexer across all production vaults (excluding paused and test vaults with deposit_cap=0).',
  neutron: { tvl },
}

