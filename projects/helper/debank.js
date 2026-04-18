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

function _cacheKey(endpoint, owners) {
  return endpoint + ':' + owners.map(o => o.toLowerCase()).sort().join(',')
}

async function _fetchDebank(endpoint, owners) {
  const key = _cacheKey(endpoint, owners)
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
          params: { id, is_all: true },
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

async function sumTokensDebank(api, owners, { blacklistedTokens = [], stripPoolTokens = false } = {}) {
  const allData = await _fetchDebank('all_complex_protocol_list', owners)
  const blacklist = new Set(blacklistedTokens.map(t => t.toLowerCase()))

  for (const protocols of allData) {
    for (const protocol of protocols || []) {
      if (getLlamaChain(protocol.chain) !== api.chain) continue
      for (const item of protocol.portfolio_item_list || []) {
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
}

module.exports = {
  sumTokensDebank,
}
