const axios = require("axios")
const { getEnv } = require('./env')
const { getUniqueAddresses } = require('./utils')
const { get } = require('./http')
const { getCache, setCache, } = require('./cache')
const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')

async function covalentGetTokens(address, api, {
  onlyWhitelisted = true,
  useCovalent = false,
  skipCacheRead = false,
  ignoreMissingChain = false,
} = {}) {
  const chainId = api?.chainId
  const chain = api?.chain
  if (!chainId) throw new Error('Missing chain to chain id mapping:' + api.chain)
  if (!address) throw new Error('Missing adddress')

  if (['mantle', 'blast'].includes(chain)) useCovalent = true

  if (!useCovalent) {
    if (!ankrChainMapping[chain]) {
      if (ignoreMissingChain) return Object.values(ADDRESSES[chain] ?? []).concat([ADDRESSES.null])
      throw new Error('Chain Not supported: ' + chain)
    }
    const tokens = await ankrGetTokens(address, { onlyWhitelisted, skipCacheRead, })
    return tokens[ankrChainMapping[chain]] ?? []
  }

  const timeNow = +Date.now()
  const THREE_DAYS = 3 * 24 * 3600 * 1000
  const project = 'covalent-cache'
  const key = `${address}/${chain}`
  const cache = (await getCache(project, key)) ?? {}
  if (!cache.timestamp || (cache.timestamp + THREE_DAYS) < timeNow) {
    cache.data = await _covalentGetTokens()
    cache.timestamp = timeNow
    await setCache(project, key, cache)
  }

  return cache.data

  async function _covalentGetTokens() {
    const {
      data: { items }
    } = await get(`https://api.covalenthq.com/v1/${chainId}/address/${address}/balances_v2/?&key=${getEnv('COVALENT_KEY')}`)
    let table = {}
    items
      .filter(i => +i.balance > 0)
      .forEach(i => table[i.contract_name || 'null'] = i.contract_address)
    return items
      .filter(i => +i.balance > 0)
      .map(i => i.contract_address.toLowerCase())
  }
}

const ankrTokenCalls = {}

const ankrChainMapping = {
  ethereum: 'eth',
  base: 'base',
  bsc: 'bsc',
  arbitrum: 'arbitrum',
  optimism: 'optimism',
  fantom: 'fantom',
  polygon: 'polygon',
  polygon_zkevm: 'polygon_zkevm',
  era: 'zksync_era',
  avax: 'avalanche',
  flare: 'flare',
  xdai: 'gnosis',
  linea: 'linea',
  rollux: 'rollux',
  scroll: 'scroll',
  syscoin: 'syscoin',
  moonbeam: 'moonbeam'
}

async function ankrGetTokens(address, { onlyWhitelisted = true, skipCacheRead = false } = {}) {
  address = address.toLowerCase()

  if (!ankrTokenCalls[address]) ankrTokenCalls[address] = _call()
  return ankrTokenCalls[address]

  async function _call() {
    const project = 'ankr-cache'
    const key = onlyWhitelisted ? address : `${address}/all`
    const timeNow = Math.floor(Date.now() / 1e3)
    const THREE_DAYS = 3 * 24 * 3600
    const cache = (await getCache(project, key)) ?? {}
    if (!skipCacheRead && cache.timestamp && (timeNow - cache.timestamp) < THREE_DAYS)
      return cache.tokens

    sdk.log('Pulling tokens for ' + address)

    const options = {
      method: 'POST',
      url: `https://rpc.ankr.com/multichain/${getEnv('ANKR_API_KEY')}`,
      params: { ankr_getAccountBalance: '' },
      headers: { accept: 'application/json', 'content-type': 'application/json' },
      data: {
        jsonrpc: '2.0',
        method: 'ankr_getAccountBalance',
        params: {
          blockchain: Object.values(ankrChainMapping),
          onlyWhitelisted,
          nativeFirst: true,
          skipSyncCheck: true,
          walletAddress: address
        },
        id: 42
      }
    };
    const tokens = cache.tokens ?? {}
    const { data: { result: { assets } } } = await axios.request(options)
    const tokenCache = { timestamp: timeNow, tokens, }
    for (const asset of assets) {
      const { contractAddress, blockchain } = asset
      if (!tokens[blockchain]) tokens[blockchain] = []
      tokens[blockchain].push(contractAddress ?? ADDRESSES.null)
    }
    for (const [chain, values] of Object.entries(tokens)) {
      tokens[chain] = getUniqueAddresses(values)
    }
    // tokens.eth = await getETHTokens(address, onlyWhitelisted)

    await setCache(project, key, tokenCache)
    return tokens
  }
}

async function getETHTokens(address, onlyWhitelisted) {
  const endpoint = getEnv('ETHEREUM_TOKENS_ENDPOINT')
  if (!endpoint) throw new Error('Missing endpoint for ethereum tokens')
  const url = `${endpoint}/v1/1/address/${address}/balances_v2/`
  const { data: { items } } = await get(url)
  const tokenSet = new Set()
  items.forEach(i => {
    const token = i.native_token ? ADDRESSES.null : i.contract_address
    if (i.is_spam && onlyWhitelisted) return;
    tokenSet.add(token)
  })
  return Array.from(tokenSet)
}

async function getComplexTreasury(owners) {
  const networks = ["ethereum", "polygon", "optimism", "gnosis", "binance-smart-chain", "fantom", "avalanche", "arbitrum",
    "celo", "harmony", "moonriver", "bitcoin", "cronos", "aurora", "evmos"]
  const data = await axios.get(`https://api.zapper.xyz/v2/balances/apps?${owners.map(a => `addresses=${a}`).join("&")}&${networks.map(a => `networks=${a}`).join("&")}`, {
    headers: {
      Authorization: `Basic ${btoa(process.env.ZAPPER_API_KEY)}`
    }
  })
  let sum = 0
  data.data.forEach(d => {
    sum += d.balanceUSD
  })
  return sum
}


module.exports = {
  covalentGetTokens,
  ankrChainMapping,
}
