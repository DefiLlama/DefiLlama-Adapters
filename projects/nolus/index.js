const { queryContract, queryManyContracts, queryContracts } = require('../helper/chain/cosmos')
const { sleep } = require('../helper/utils')

// Admin contract that holds a registry of all active protocols
const ADMIN_CONTRACT = 'nolus1gurgpv8savnfw66lckwzn4zk7fp394lpe667dhu7aw48u40lj6jsqxf8nd'

// batch config for lease queries
const BATCH = { size: 30, pauseMs: 300, jitterMs: 120, maxRetries: 2 }
const sleepMs = (n) => new Promise(r => setTimeout(r, n))

// CoinGecko IDs for known tickers
const COINGECKO_IDS = {
  'USDC': 'usd-coin',
  'USDC_NOBLE': 'usd-coin',
  'ALL_BTC': 'osmosis-allbtc',
  'ALL_SOL': 'osmosis-allsol',
  'AKT': 'akash-network',
  'ATOM': 'cosmos',
  'OSMO': 'osmosis',
}

// Protocols to skip for lease TVL queries (e.g., malfunctioning leases)
// LPP TVL is still counted for these protocols
const SKIP_LEASE_QUERIES = ['OSMOSIS-OSMOSIS-USDC_AXELAR']

/**
 * Fetches all active protocol names from the admin contract
 */
async function getProtocolNames() {
  const result = await queryContract({
    contract: ADMIN_CONTRACT,
    chain: 'nolus',
    data: { protocols: {} }
  })
  return result || []
}

/**
 * Fetches protocol details (contracts) for a given protocol name
 */
async function getProtocolDetails(protocolName) {
  const result = await queryContract({
    contract: ADMIN_CONTRACT,
    chain: 'nolus',
    data: { protocol: protocolName }
  })
  return result
}

/**
 * Fetches all protocols with their contract addresses
 */
async function getAllProtocols() {
  const protocolNames = await getProtocolNames()
  const protocols = []

  for (const name of protocolNames) {
    await sleep(200) // Rate limiting
    const details = await getProtocolDetails(name)
    if (details && details.contracts) {
      protocols.push({
        name,
        network: details.network,
        dex: details.dex,
        leaser: details.contracts.leaser,
        lpp: details.contracts.lpp,
        oracle: details.contracts.oracle,
      })
    }
  }

  return protocols
}

/**
 * Gets the LPN ticker from an LPP contract
 */
async function getLpnTicker(lppAddr) {
  const result = await queryContract({
    contract: lppAddr,
    chain: 'nolus',
    data: { lpn: [] }
  })
  return result
}

/**
 * Gets currency info (including decimals) from oracle
 */
async function getCurrencyInfo(oracleAddr, ticker) {
  const currencies = await queryContract({
    contract: oracleAddr,
    chain: 'nolus',
    data: { currencies: {} }
  })

  if (!Array.isArray(currencies)) return null

  return currencies.find(c => c && c.ticker === ticker)
}

async function getLeaseCodeId(leaserAddress) {
  const leaserContract = await queryContract({
    contract: leaserAddress,
    chain: 'nolus',
    data: { config: {} }
  })
  return leaserContract?.config?.lease_code || 0
}

async function getLeaseContracts(leaseCodeId) {
  return await queryContracts({ chain: 'nolus', codeId: leaseCodeId })
}

async function getLeasesThrottled(leaseAddresses) {
  const results = new Array(leaseAddresses.length).fill(null)

  for (let i = 0; i < leaseAddresses.length; i += BATCH.size) {
    const start = i
    const end = Math.min(i + BATCH.size, leaseAddresses.length)
    const chunk = leaseAddresses.slice(start, end)

    let ok = false
    for (let attempt = 0; attempt <= BATCH.maxRetries; attempt++) {
      try {
        const res = await queryManyContracts({
          contracts: chunk,
          chain: 'nolus',
          data: { state: {} },
          permitFailure: true,
        })
        for (let j = 0; j < chunk.length; j++) {
          results[start + j] = (res && res[j] !== undefined) ? res[j] : null
        }
        ok = true
        break
      } catch (e) {
        if (attempt === BATCH.maxRetries) {
          throw new Error(`[states] batch ${start}-${end} failed after ${attempt + 1} attempts: ${e?.message || e}`)
        }
        await sleepMs(300 * (attempt + 1) + Math.floor(Math.random() * 200))
      }
    }

    if (ok && end < leaseAddresses.length) {
      const pause = BATCH.pauseMs + Math.floor(Math.random() * BATCH.jitterMs)
      await sleepMs(pause)
    }
  }

  // End-to-end invariant: no missing states
  const missing = results.reduce((n, v) => n + (v == null ? 1 : 0), 0)
  if (missing > 0) {
    // HARD FAIL - better to error than publish partial TVL
    throw new Error(`[states] incomplete data: missing ${missing} of ${results.length}`)
  }

  return results
}

/**
 * Gets LPP TVL for a protocol, with decimals fetched from oracle
 * Only counts the available balance (not borrowed), since borrowed funds
 * are represented in the lease positions on Osmosis/Neutron
 */
async function getProtocolLppTvl(protocol) {
  // Get LPN ticker
  const ticker = await getLpnTicker(protocol.lpp)
  if (!ticker) return { ticker: null, amount: 0 }

  // Get currency info for decimals
  const currencyInfo = await getCurrencyInfo(protocol.oracle, ticker)
  const decimals = currencyInfo?.decimal_digits || 6

  // Get LPP balance (available assets in the pool)
  const lppBalance = await queryContract({
    contract: protocol.lpp,
    chain: 'nolus',
    data: { lpp_balance: [] }
  })

  const amount = Number(lppBalance?.balance?.amount || 0) / Math.pow(10, decimals)

  return { ticker, amount, dexSymbol: currencyInfo?.dex_symbol }
}

function sumAssets(api, leases, currencies) {
  if (!Array.isArray(leases)) return
  leases.forEach(v => {
    if (!v || !v.opened || !v.opened.amount) return
    const ticker = v.opened.amount.ticker
    const amount = parseInt(v.opened.amount.amount, 10)
    if (!Number.isFinite(amount)) return

    const currencyData = currencies.find(n => n && n.ticker === ticker)
    if (!currencyData || !currencyData.dex_symbol) return

    api.add(currencyData.dex_symbol, amount)
  })
}

async function fetchLeaseTvl(api, protocols) {
  for (const p of protocols) {
    // Skip protocols with malfunctioning leases (if any)
    if (SKIP_LEASE_QUERIES.includes(p.name)) continue

    await sleep(2000)
    const oracleData = await queryContract({
      contract: p.oracle,
      chain: 'nolus',
      data: { currencies: {} }
    })
    const leaseCodeId = await getLeaseCodeId(p.leaser)
    const leaseContracts = await getLeaseContracts(leaseCodeId)
    const leases = await getLeasesThrottled(leaseContracts)
    sumAssets(api, leases, oracleData)
  }
}

module.exports = {
  methodology: 'The combined total of lending pool assets and the current market value of active margin positions',
  nolus: {
    tvl: async () => {
      const protocols = await getAllProtocols()

      // Group LPP TVL by CoinGecko ID
      const tvlByCoingeckoId = {}

      for (const protocol of protocols) {
        await sleep(300)
        const { ticker, amount } = await getProtocolLppTvl(protocol)
        if (!ticker || amount === 0) continue

        const coingeckoId = COINGECKO_IDS[ticker]
        if (!coingeckoId) {
          console.warn(`Unknown ticker: ${ticker} for protocol ${protocol.name}`)
          continue
        }

        tvlByCoingeckoId[coingeckoId] = (tvlByCoingeckoId[coingeckoId] || 0) + amount
      }

      return tvlByCoingeckoId
    }
  },
  neutron: {
    tvl: async (api) => {
      const protocols = await getAllProtocols()
      const neutronProtocols = protocols.filter(p => p.network === 'Neutron')
      return await fetchLeaseTvl(api, neutronProtocols)
    }
  },
  osmosis: {
    tvl: async (api) => {
      const protocols = await getAllProtocols()
      const osmosisProtocols = protocols.filter(p => p.network === 'Osmosis')
      return await fetchLeaseTvl(api, osmosisProtocols)
    }
  }
}

// node test.js projects/nolus/index.js
