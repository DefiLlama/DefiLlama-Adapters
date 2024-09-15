const abi = require('./abis/compound.json');
const { sumTokens2, nullAddress, } = require('./unwrapLPs')
const methodologies = require('./methodologies');

// returns [{cToken, underlying}]
async function getMarkets(comptroller, api, cether, cetheEquivalent = nullAddress, blacklist = [], abis = {}) {

  if (cether) {
    if (!Array.isArray(cether)) cether = [cether]
    cether = new Set(cether.map(i => i.toLowerCase()))
  }
  const blacklistSet = new Set([...blacklist].map(i => i.toLowerCase()))
  const cTokens = (await api.call({ abi: abis.getAllMarkets, target: comptroller })).map(i => i.toLowerCase())
  const underlyings = await api.multiCall({ abi: abi.underlying, calls: cTokens, permitFailure: true })

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
    let markets = await getMarkets(comptroller, api, cether, cetheEquivalent, blacklistedTokens, abis)
    const cTokens = markets.map(market => market.cToken)
    const tokens = markets.map(market => market.underlying)
    if (!borrowed)
      return sumTokens2({ api, tokensAndOwners2: [tokens, cTokens], blacklistedTokens, resolveLP: true, })

    let v2Locked = await api.multiCall({ calls: cTokens, abi: borrowed ? abis.totalBorrows : abis.getCash, })
    api.add(tokens, v2Locked)

    blacklistedTokens.forEach(token => api.removeTokenBalance(token))

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
