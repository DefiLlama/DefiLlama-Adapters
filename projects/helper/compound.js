const abi = require('./abis/compound.json');
const { sumTokens2, nullAddress, } = require('./unwrapLPs')
const methodologies = require('./methodologies');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))
const MAX_RETRY_ATTEMPTS = 2
const RETRY_SLEEP_MS = 50

// returns [{cToken, underlying}]
async function getMarkets(comptroller, api, cether, cetheEquivalent = nullAddress, blacklist = [], abis = {}) {

  if (cether) {
    if (!Array.isArray(cether)) cether = [cether]
    cether = new Set(cether.map(i => i.toLowerCase()))
  }
  const blacklistSet = new Set([...blacklist].map(i => i.toLowerCase()))
  const cTokens = (await api.call({ abi: abis.getAllMarkets, target: comptroller })).map(i => i.toLowerCase())
  const underlyings = await api.multiCall({ abi: abi.underlying, calls: cTokens, permitFailure: true })
  // defensive code to retry missing underlyings from .multicall() with simpler .call()
  const missingIdx = []
  underlyings.forEach((underlying, i) => {
    if (!underlying) missingIdx.push(i)
  })
  if (missingIdx.length) {
    await Promise.all(missingIdx.map(async (idx) => {
      const target = cTokens[idx]
      let result
      for (let attempt = 0; attempt < MAX_RETRY_ATTEMPTS; attempt += 1) {
        result = await api.call({ abi: abi.underlying, target, permitFailure: true })
        if (result) break
        await sleep(RETRY_SLEEP_MS)
      }
      if (result) underlyings[idx] = result
    }))
  }

  const markets = []
  underlyings.forEach((underlying, i) => {
    const cToken = cTokens[i]
    if (cether?.has(cToken)) underlying = cetheEquivalent
    if (blacklistSet.has(cToken)) return;
    if (underlying) markets.push({ cToken, underlying })
    else throw new Error(`Market rugged, is that market CETH? ${cToken}`)
  })
  return markets;
}

function _getCompoundV2Tvl(comptroller, cether, cetheEquivalent, borrowed = false, { blacklistedTokens = [], abis = {}, } = {}) {
  abis = { ...abi, ...abis }
  return async (api) => {
    const markets = await getMarkets(comptroller, api, cether, cetheEquivalent, blacklistedTokens, abis)
    const cTokens = markets.map(market => market.cToken)
    const tokens = markets.map(market => market.underlying)
    if (!borrowed)
      return sumTokens2({ api, tokensAndOwners2: [tokens, cTokens], blacklistedTokens, resolveLP: true, })

    const v2Locked = await api.multiCall({ calls: cTokens, abi: borrowed ? abis.totalBorrows : abis.getCash, })
    api.add(tokens, v2Locked)

    blacklistedTokens.forEach((token) => {
      api.removeTokenBalance(token)
    })

    return sumTokens2({ api, resolveLP: true, });
  }
}

function compoundExports(comptroller, cether, cetheEquivalent = nullAddress, { blacklistedTokens = [], abis = {}, } = {}) {
  return {
    tvl: _getCompoundV2Tvl(comptroller, cether, cetheEquivalent, false, { blacklistedTokens, abis, }),
    borrowed: _getCompoundV2Tvl(comptroller, cether, cetheEquivalent, true, { blacklistedTokens, abis, })
  }
}

function compoundExports2({ comptroller, cether, cetheEquivalent = nullAddress, blacklistedTokens = [], abis = {}, }) {
  return compoundExports(comptroller, cether, cetheEquivalent, { blacklistedTokens, abis, })
}

module.exports = {
  methodology: methodologies.lendingMarket,
  compoundExports,
  compoundExports2,
};
