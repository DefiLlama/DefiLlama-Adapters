const axios = require('axios')
const { getEnv } = require('./env')
const { nullAddress } = require('./sumTokens')

const DEBANK_API_BASE = 'https://pro-openapi.debank.com/v1/user'

const debankToLlamaChain = {
  eth: 'ethereum',
  op: 'optimism',
  arb: 'arbitrum',
  avax: 'avax',
  bsc: 'bsc',
  ftm: 'fantom',
  sonic: 'sonic',
  base: 'base',
  matic: 'polygon',
  frax: 'fraxtal',
  mnt: 'mantle',
  gno: 'xdai',
}

function getLlamaChain(debankChain) {
  return debankToLlamaChain[debankChain] || debankChain
}

const _cache = {}

function _cacheKey(endpoint, owners, isAll) {
  return endpoint + ':' + isAll + ':' + owners.map(o => o.toLowerCase()).sort().join(',')
}

async function _fetchDebank(endpoint, owners, { isAll = true } = {}) {
  const key = _cacheKey(endpoint, owners, isAll)
  if (!_cache[key]) {
    const apiKey = getEnv('DEBANK_API_KEY')
    if (!apiKey) {
      _cache[key] = Promise.resolve(owners.map(() => []))
      return _cache[key]
    }
    const headers = { accept: 'application/json', AccessKey: apiKey }
    _cache[key] = Promise.all(
      owners.map(id =>
        axios.get(`${DEBANK_API_BASE}/${endpoint}`, {
          params: { id, is_all: isAll },
          headers,
        }).then(r => r.data).catch(e => {
          console.log(`DeBank ${endpoint} failed for ${id}: ${e.response?.status || e.message}`)
          return []
        })
      )
    )
  }
  return _cache[key]
}

function _normalizeAddr(rawId) {
  if (!rawId) return null
  return rawId === 'eth' ? nullAddress : rawId.toLowerCase()
}

/**
 * Sum token balances from DeBank for the given wallet addresses.
 * Uses `all_complex_protocol_list` for DeFi protocol positions (decomposed into underlying assets)
 * and optionally `all_token_list` for idle wallet-held tokens not in any protocol.
 *
 * @param {string[]} owners - Wallet addresses to query
 * @param {string[]} [opts.blacklistedTokens] - Token addresses to skip when adding balances (applies to both endpoints)
 * @param {string[]} [opts.blacklistedPools] - Skip protocol positions whose pool.id matches (e.g. vault addresses already tracked on-chain)
 * @param {boolean} [opts.stripPoolTokens] - Remove pool/LP token balances that have been added by a separate on-chain read (avoids double-counting with DeBank)
 * @param {boolean} [opts.includeWalletTokens] - Also fetch idle wallet tokens via `all_token_list` (is_all=false filters out protocol-derived tokens)
 */
async function sumTokensDebank(api, owners, { blacklistedTokens = [], blacklistedPools = [], stripPoolTokens = false, includeWalletTokens = false } = {}) {
  const allData = await _fetchDebank('all_complex_protocol_list', owners)
  const blacklist = new Set(blacklistedTokens.map(t => t.toLowerCase()))
  const poolBlacklist = blacklistedPools.length ? new Set(blacklistedPools.map(p => p.toLowerCase())) : null

  for (const protocols of allData) {
    for (const protocol of protocols || []) {
      if (getLlamaChain(protocol.chain) !== api.chain) continue
      for (const item of protocol.portfolio_item_list || []) {
        if (poolBlacklist && item.pool?.id && poolBlacklist.has(item.pool.id.toLowerCase())) continue
        for (const token of item.asset_token_list || []) {
          const addr = _normalizeAddr(token.id)
          if (!addr || blacklist.has(addr)) continue
          api.add(addr, token.amount * 10 ** token.decimals)
        }
        if (stripPoolTokens && item.pool?.id) {
          api.removeTokenBalance(item.pool.id.toLowerCase())
        }
      }
    }
  }

  if (includeWalletTokens) {
    const walletData = await _fetchDebank('all_token_list', owners, { isAll: false })
    for (const tokens of walletData) {
      for (const token of tokens || []) {
        if (getLlamaChain(token.chain) !== api.chain) continue
        const addr = _normalizeAddr(token.id)
        if (!addr || blacklist.has(addr)) continue
        if (token.amount > 0) api.add(addr, token.amount * 10 ** token.decimals)
      }
    }
  }
}

module.exports = {
  sumTokensDebank,
}
