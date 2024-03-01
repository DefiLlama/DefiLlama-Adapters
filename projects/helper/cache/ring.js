
const ringAbi = require('../abis/ring')
const { getCache, setCache, } = require('../cache');
const { transformBalances } = require('../portedTokens')
const { getCoreAssets, normalizeAddress, } = require('../tokenMapping')
const sdk = require('@defillama/sdk')

const cacheFolder = 'uniswap-forks'

function getRingTVL({ coreAssets, blacklist = [], factory, blacklistedTokens,
  useDefaultCoreAssets = false,
  abis = {},
  chain: _chain = 'ethereum',
  hasStablePools = false,
  stablePoolSymbol = 'sAMM',
  permitFailure = false,
}) {

  let updateCache = false

  const abi = { ...ringAbi, ...abis }

  return async (_, _b, cb, { api, chain } = {}) => {
    // console.log(await api.call({ abi: 'address:factory', target: factory }))
    // console.log(await api.call({ abi: 'address:factory', target: '0x5f0776386926e554cb088df5848ffd7c5f02ebfa' }))

    chain = chain ?? api?.chain
    if (!chain)
      chain = _chain
    factory = normalizeAddress(factory, chain)
    blacklist = (blacklistedTokens || blacklist).map(i => normalizeAddress(i, chain))
    const key = `${factory}-${chain}`

    if (!coreAssets && useDefaultCoreAssets)
      coreAssets = getCoreAssets(chain)

    let cache = await _getCache(cacheFolder, key, api)

    const _oldWrappedTokenInfoLength = cache.wrappedTokens.length
    const length = await api.call({ abi: abi.allWrappedTokensLength, target: factory, })

    sdk.log(chain, ' No. of wrapped tokens: ', length)
    sdk.log('cached info', cache.wrappedTokens.length)
    const wrappedTokenCalls = []
    for (let i = _oldWrappedTokenInfoLength; i < length; i++)
      wrappedTokenCalls.push(i)

    const calls = await api.multiCall({ abi: abi.allWrappedTokens, calls: wrappedTokenCalls, target: factory })

    const [
      tokens
    ] = await Promise.all([
      api.multiCall({ abi: abi.token, calls }),
    ])
    let symbols
    if (hasStablePools) {
      symbols = await api.multiCall({ abi: 'erc20:symbol', calls, })
      cache.symbols.push(...symbols)
    }

    cache.wrappedTokens.push(...calls)
    cache.tokens.push(...tokens)

    updateCache = updateCache || cache.wrappedTokens.length > _oldWrappedTokenInfoLength

    if (updateCache)
      await setCache(cacheFolder, key, cache)

    if (cache.wrappedTokens.length > length)
      cache.wrappedTokens = cache.wrappedTokens.slice(0, length)

    let reserves = []
    const balanceCalls = []
    cache.wrappedTokens.forEach((owner, i) => {
      balanceCalls.push({ target: cache.tokens[i], params: owner })
    })
    const bals = await api.multiCall({ abi: abi.balanceOf ?? 'erc20:balanceOf', calls: balanceCalls, permitFailure, })
    for (let i = 0; i < bals.length; i++) {
      reserves.push({ _reserve: bals[i] ?? 0 })
      i++
    }


    const balances = {}
    if (coreAssets) {
      const data = []
      reserves.forEach((dat, i) => {
        if (!dat) return;
        const { _reserve } = dat
        if (hasStablePools && cache.symbols[i].startsWith(stablePoolSymbol)) {
          sdk.log('found stable pool: ', stablePoolSymbol)
          sdk.util.sumSingleBalance(balances, cache.tokens[i], _reserve)
        } else {
          data.push({
            token: cache.tokens[i],
            tokenBal: _reserve,
          })
        }
      })
      return transformRingBalances({ balances, chain, data, coreAssets, blacklistedTokens: blacklist })
    }

    const blacklistedSet = new Set(blacklist)
    reserves.forEach(({ _reserve }, i) => {
      if (!blacklistedSet.has(cache.tokens[i].toLowerCase())) sdk.util.sumSingleBalance(balances, cache.tokens[i], _reserve)
    })

    return transformBalances(chain, balances)
  }

  async function _getCache(cacheFolder, key, api) {
    let cache = await getCache(cacheFolder, key)
    if (cache.wrappedTokens) {
      for (let i = 0; i < cache.wrappedTokens.length; i++) {
        if (!cache.wrappedTokens[i]) {
          cache.wrappedTokens[i] = await api.call({ abi: abi.allWrappedTokens, target: factory, params: i })
          updateCache = true
        }
        let wrappedToken = cache.wrappedTokens[i]
        if (!cache.tokens[i]) {
          cache.tokens[i] = await api.call({ abi: abi.token, target: wrappedToken })
          updateCache = true
        }
      }
    }

    if (!cache.wrappedTokens || (hasStablePools && (!cache.symbols || !cache.symbols.length))) {
      cache = {
        wrappedTokens: [],
        tokens: [],
        symbols: [],
      }
    }
    return cache
  }
}

async function transformRingBalances({ api, chain, data, balances, restrictTokenRatio = 5, withMetadata = false, blacklistedTokens = [], coreTokens }) {

  if (api) {
    balances = api.getBalances()
    chain = api.chain
  } else if (!balances) balances = {}
  if (!coreTokens)
    coreTokens = new Set(getCoreAssets(chain))

  blacklistedTokens.forEach(i => coreTokens.delete(i))

  const prices = {}
  data.forEach(i => {
    i.token = normalizeAddress(i.token, chain)
    i.tokenBal = +i.tokenBal
  })
  data.forEach(addTokens)
  updateBalances(balances)

  blacklistedTokens.forEach(i => delete balances[i])

  if (!withMetadata)
    return transformBalances(chain, balances)
  return {
    prices,
    updateBalances,
    balances: await transformBalances(chain, balances),
  }

  function addTokens({ token, tokenBal }) {
    sdk.util.sumSingleBalance(balances, token, tokenBal)
  }

  function updateBalances(balances) {
    Object.entries(balances).forEach(([token]) => {
      let bal = +balances[token] // this is safer as token balance might change while looping when two entries for same token exist
      const tokenKey = normalizeAddress(token, chain)
      if (!prices[tokenKey]) return;
      const priceObj = prices[tokenKey]
      const { coreToken, price } = priceObj
      delete balances[token]
      if (bal > priceObj.convertableTokenAmount) {
        const unconverted = bal - priceObj.convertableTokenAmount
        const convertible = priceObj.convertableTokenAmount
        priceObj.convertableTokenAmount = 0
        sdk.util.sumSingleBalance(balances, tokenKey, unconverted)
        sdk.util.sumSingleBalance(balances, coreToken, convertible * price)
        return
      }

      priceObj.convertableTokenAmount -= bal
      sdk.util.sumSingleBalance(balances, coreToken, bal * price)
    })
  }
}

module.exports = {
  getRingTVL
}