const { getConfig } = require('../helper/cache')
const { CHAIN_CONFIG } = require('./config')

// API amounts are human-readable decimal strings; convert to raw integer units (no float).
function toRaw(value, decimals) {
  if (value == null || decimals == null) return null
  const s = String(value).trim()
  if (!s || isNaN(Number(s))) return null
  const d = Number(decimals)
  const neg = s.startsWith('-')
  const [intPart, fracPart = ''] = s.replace('-', '').split('.')
  const frac = (fracPart + '0'.repeat(d)).slice(0, d)
  const raw = BigInt(intPart || '0') * 10n ** BigInt(d) + BigInt(frac || '0')
  return (neg ? -raw : raw).toString()
}

async function getV2Data(chain) {
  const { cacheKey, apiUrl } = CHAIN_CONFIG[chain]
  return (await getConfig(cacheKey, apiUrl)).data
}

function getVaultList(data) {
  if (!data?.allVaults?.list) return []
  return Array.isArray(data.allVaults.list) ? data.allVaults.list : [data.allVaults.list]
}

function getMarkets(vault) {
  if (!vault.markets) return []
  if (Array.isArray(vault.markets)) return vault.markets
  if (vault.markets.markets) {
    return Array.isArray(vault.markets.markets) ? vault.markets.markets : [vault.markets.markets]
  }
  return []
}

// Add a token by its real on-chain address so DefiLlama prices it itself (no CG-id mapping,
// no USD passthrough). Amount is converted from the API's human-readable value to raw units.
function addToken(api, address, amount, decimals) {
  const raw = toRaw(amount, decimals)
  if (!address || raw == null || raw === '0') return
  api.add(address, raw)
}

// Walk every unique market across all vaults.
function eachMarket(data, fn) {
  const seen = new Set()
  getVaultList(data).forEach(vault => {
    getMarkets(vault).forEach(market => {
      if (market.id && seen.has(market.id)) return
      if (market.id) seen.add(market.id)
      fn(market)
    })
  })
}

function buildTvl(chain) {
  return async function tvl(api) {
    const data = await getV2Data(chain)
    eachMarket(data, market => {
      addToken(api, market.borrowAddress, market.totalSupplyAssets, market.borrowDecimals)
      addToken(api, market.collateralAddress, market.totalCollateralAssets, market.collateralDecimals)
    })
  }
}

function buildBorrowed(chain) {
  return async function borrowed(api) {
    const data = await getV2Data(chain)
    eachMarket(data, market => {
      addToken(api, market.borrowAddress, market.totalBorrowAssets, market.borrowDecimals)
    })
  }
}

module.exports = {
  timetravel: false,
  methodology:
    "JustLend V2 is an isolated-market lending protocol on Tron. TVL sums each market's supplied assets (loan token) and posted collateral; borrowed sums each market's outstanding debt. Balances come from the JustLend V2 vault-list API and are valued by their real on-chain token addresses.",
}

Object.keys(CHAIN_CONFIG).forEach(chain => {
  module.exports[chain] = {
    tvl: buildTvl(chain),
    borrowed: buildBorrowed(chain),
  }
})
