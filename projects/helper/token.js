const axios = require("axios")
const { getEnv } = require('./env')
const { getUniqueAddresses } = require('./utils')
const { get } = require('./http')
const { getCache, setCache, } = require('./cache')
const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')

// Maps adapter chain names to their @defillama/sdk providerListJSON key when the two differ.
// Most chains match directly; add an entry here only for known mismatches.
const blockscoutChainAlias = {
  robinhood: 'robinhoodchain',
}

// Resolve a chain's blockscout explorer base url (without trailing slash) from @defillama/sdk's
// providerListJSON, so token auto-discovery works for any blockscout-backed chain without a
// per-chain config. Returns undefined when the chain has no blockscout explorer registered.
function getBlockscoutUrl(chain, chainId) {
  const providers = sdk.providerListJSON ?? {}
  // 1. direct key match / known alias  2. fall back to matching by chainId
  let entry = providers[chain] ?? providers[blockscoutChainAlias[chain]]
  if (!entry?.explorer && chainId)
    entry = Object.values(providers).find(p => p.chainId === chainId && p.explorer)
  const explorer = entry?.explorer
  if (!explorer || !/blockscout/i.test(explorer)) return undefined
  return explorer.replace(/\/+$/, '')
}

// Auto-discover the ERC20 tokens held by `address` on a blockscout-backed chain via the
// blockscout v2 API. Cached for 3 days like the covalent/ankr paths. Returns lowercased
// contract addresses (plus the native token) with a non-zero balance.
async function blockscoutGetTokens(address, api, { onlyUseExistingCache = false } = {}) {
  const chain = api?.chain
  if (!address) throw new Error('Missing address')
  const baseUrl = getBlockscoutUrl(chain, api?.chainId)
  if (!baseUrl) throw new Error('No blockscout explorer found for chain: ' + chain)

  const timeNow = +Date.now()
  const THREE_DAYS = 3 * 24 * 3600 * 1000
  const project = 'blockscout-cache'
  const key = `${chain}/${address.toLowerCase()}`
  const cache = (await getCache(project, key)) ?? {}
  if (!cache.timestamp || ((cache.timestamp + THREE_DAYS) < timeNow && !onlyUseExistingCache)) {
    cache.data = await _blockscoutGetTokens()
    cache.timestamp = timeNow
    await setCache(project, key, cache)
  }

  return cache.data

  async function _blockscoutGetTokens() {
    const tokens = [ADDRESSES.null]
    const items = await get(`${baseUrl}/api/v2/addresses/${address}/token-balances`)
    if (Array.isArray(items)) {
      items
        .filter(i => i?.token?.type === 'ERC-20' && +i.value > 0 && i.token.address_hash)
        .forEach(i => tokens.push(i.token.address_hash.toLowerCase()))
    }
    return getUniqueAddresses(tokens, chain)
  }
}

async function covalentGetTokens(address, api, {
  onlyWhitelisted = true,
  useCovalent = false,
  skipCacheRead = false,
  ignoreMissingChain = false,
  onlyUseExistingCache = false,
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
  if (!cache.timestamp || ((cache.timestamp + THREE_DAYS) < timeNow && !onlyUseExistingCache)) {
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
  era: 'zksync_era',  // ankr has issues
  avax: 'avalanche',
  flare: 'flare',
  xdai: 'gnosis',
  linea: 'linea',
  rollux: 'rollux',
  scroll: 'scroll',
  syscoin: 'syscoin',
  moonbeam: 'moonbeam'  // ankr has issues
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

    try {
      const cachedTokens = cache?.tokens ?? {}
      const problemChains = ['zksync_era', 'moonbeam', 'linea', "polygon_zkevm",]
      const problemChainSet = new Set(problemChains)
      const options = {
        method: 'POST',
        url: `https://rpc.ankr.com/multichain/${getEnv('ANKR_API_KEY')}`,
        params: { ankr_getAccountBalance: '' },
        headers: { accept: 'application/json', 'content-type': 'application/json' },
        data: {
          jsonrpc: '2.0',
          method: 'ankr_getAccountBalance',
          params: {
            blockchain: Object.values(ankrChainMapping).filter(c => !problemChainSet.has(c)),
            onlyWhitelisted,
            nativeFirst: true,
            skipSyncCheck: true,
            walletAddress: address
          },
          id: 42
        },
        timeout: 45000, // 45 seconds timeout
      };
      const tokens = cache.tokens ?? {}
      // console.log('Fetching tokens from Ankr for address:', address, options.data.params.blockchain, (await axios.request(options)).data.result.assets)
      const { data: { result: { assets } } } = await axios.request(options)
      const tokenCache = { timestamp: timeNow, tokens, }
      for (const asset of assets) {
        const { contractAddress, blockchain } = asset
        if (!tokens[blockchain]) tokens[blockchain] = []
        tokens[blockchain].push(contractAddress ?? ADDRESSES.null)
      }
      problemChains.forEach(chain => {
        if (cachedTokens[chain]) tokens[chain] = cachedTokens[chain]
      })

      // Remove duplicates
      for (const [chain, values] of Object.entries(tokens)) {
        tokens[chain] = getUniqueAddresses(values)
      }
      // tokens.eth = await getETHTokens(address, onlyWhitelisted)

      await setCache(project, key, tokenCache)
      return tokens
    } catch (e) {
      sdk.log('Error fetching tokens for ' + address, e)
      if (cache.tokens)
        return cache.tokens
      throw e
    }
  }
}

module.exports = {
  covalentGetTokens,
  blockscoutGetTokens,
  getBlockscoutUrl,
  ankrChainMapping,
}
