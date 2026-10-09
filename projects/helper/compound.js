const abi = require('./abis/compound.json');
const { sumTokens2, nullAddress, } = require('./unwrapLPs')
const methodologies = require('./methodologies');

// returns [{cToken, underlying}]
async function getMarkets(comptroller, api, cether, cetheEquivalent = nullAddress, blacklist = [], abis = {}, { blacklistedMarkets = [], markets: staticMarkets, } = {}) {

  if (cether) {
    if (!Array.isArray(cether)) cether = [cether]
    cether = new Set(cether.map(i => i.toLowerCase()))
  }
  const blacklistSet = new Set([...blacklist].map(i => i.toLowerCase()))
  // `markets` lets a config pin the cToken list when the comptroller no longer answers getAllMarkets (read it at a historical block)
  let cTokens = (staticMarkets ?? await api.call({ abi: abis.getAllMarkets, target: comptroller })).map(i => i.toLowerCase())
  cTokens = cTokens.filter(cToken => !blacklistedMarkets.includes(cToken))
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

function _getCompoundV2Tvl(comptroller, cether, cetheEquivalent, borrowed = false, { blacklistedTokens = [], abis = {}, blacklistedMarkets = [], isInsolvent = false, markets: staticMarkets, excludedBorrowers = [] } = {}) {
  abis = { ...abi, ...abis }

  if (borrowed && isInsolvent) return async () => ({})

  return async (api) => {
    let markets = await getMarkets(comptroller, api, cether, cetheEquivalent, blacklistedTokens, abis, { blacklistedMarkets, markets: staticMarkets })
    const cTokens = markets.map(market => market.cToken)
    const tokens = markets.map(market => market.underlying)
    if (!borrowed)
      return sumTokens2({ api, tokensAndOwners2: [tokens, cTokens], blacklistedTokens, resolveLP: true, })

    let v2Locked = await api.multiCall({ calls: cTokens, abi: borrowed ? abis.totalBorrows : abis.getCash, })
    // debt of accounts that will never repay (exploiters) is not live borrowing, take it back out
    for (const account of excludedBorrowers) {
      const debts = await api.multiCall({ calls: cTokens.map(target => ({ target, params: [account] })), abi: 'function borrowBalanceStored(address) view returns (uint256)', permitFailure: true })
      v2Locked = v2Locked.map((v, i) => BigInt(v) - BigInt(debts[i] ?? 0)).map(v => (v > 0n ? v : 0n).toString())
    }
    api.add(tokens, v2Locked)

    blacklistedTokens.forEach(token => api.removeTokenBalance(token))

    return sumTokens2({ api, resolveLP: true, });
  }
}

function compoundExports(comptroller, cether, cetheEquivalent = nullAddress, { blacklistedTokens = [], abis = {}, blacklistedMarkets = [], isInsolvent = false, markets, excludedBorrowers = [] } = {}) {
  return {
    tvl: _getCompoundV2Tvl(comptroller, cether, cetheEquivalent, false, { blacklistedTokens, abis, blacklistedMarkets, markets, }),
    borrowed: _getCompoundV2Tvl(comptroller, cether, cetheEquivalent, true, { blacklistedTokens, abis, blacklistedMarkets, isInsolvent, markets, excludedBorrowers })
  }
}

function compoundExports2({ comptroller, cether, cetheEquivalent = nullAddress, blacklistedTokens = [], abis = {}, blacklistedMarkets = [], isInsolvent = false, markets, excludedBorrowers = [] }) {
  return compoundExports(comptroller, cether, cetheEquivalent, { blacklistedTokens, abis, blacklistedMarkets, isInsolvent, markets, excludedBorrowers })
}

module.exports = {
  methodology: methodologies.lendingMarket,
  compoundExports,
  compoundExports2,
};
