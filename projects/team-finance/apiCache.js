const { getCache, setCache, } = require("../helper/cache")
const { vestingHelper, } = require("../helper/unknownTokens")
const config = require("./config")

const project = 'bulky/team-finance'

async function tvl(api) {
  const chain = api.chain
  const args = config[chain]
  const cache = await getCache(project, chain) || { vaults: {} }
  if (!cache.vaults) cache.vaults = {}
  const _tvl = async ({ contractABI, contract, blacklist, }) => {
    if (!cache.vaults[contract]) cache.vaults[contract] = { tokens: [], }
    const cCache = cache.vaults[contract]
    let tokens = await api.fetchList({ lengthAbi: contractABI.depositId, itemAbi: contractABI.getDepositDetails, target: contract, permitFailure: true, startFrom: cCache.tokens.length })
    tokens = tokens.filter(i => i).map(i => i._tokenAddress)
    cCache.tokens.push(...tokens)

    const balances = await vestingHelper({ ...api, cache, useDefaultCoreAssets: true, owner: contract, tokens: cCache.tokens, blacklist, })
    api.addBalances(balances)
  }
  await Promise.all(args.map(_tvl))
  await setCache(project, chain, cache)
}

module.exports = {
  methodology: `Counts each LP pair's native token and 
  stable balance, adjusted to reflect locked pair's value. 
  Balances and merged across multiple locker to return sum TVL per chain`,
  misrepresentedTokens: true,
};

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})
