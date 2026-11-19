const { polygonContractData, avalancheContractData, cronosContractData, kavaContractData } = require('./config')
const { getUniqueAddresses } = require('../helper/utils')
const { getCache, setCache, } = require("../helper/cache")
const { vestingHelper, } = require("../helper/unknownTokens")

const project = 'bulky/dexpad'

function tvl(contracts) {
  return async (api) => {
    const cache = (await getCache(project, api.chain)) || {}

    for (const entry of contracts) {
      const contract = entry.contract
      if (!cache[contract]) cache[contract] = { tokens: [], lastTotalDepositId: 0 }
      const cCache = cache[contract]

      // only pull lock indices added since last run
      const totalDepositId = +await api.call({ target: contract, abi: entry.getNumLockedTokensABI, })
      const calls = Array.from({ length: Math.max(0, totalDepositId - cCache.lastTotalDepositId) }, (_, i) => ({ target: contract, params: i + cCache.lastTotalDepositId }))
      cCache.lastTotalDepositId = totalDepositId

      const tokens = await api.multiCall({ abi: entry.getLockedTokenAtIndexABI, calls, permitFailure: true })
      cCache.tokens = getUniqueAddresses([...cCache.tokens, ...tokens.filter(Boolean)])

      const blacklist = [...(entry.pool2 || [])]
      if (api.chain === 'ethereum') blacklist.push('0x72E5390EDb7727E3d4e3436451DADafF675dBCC0') // HANU

      await vestingHelper({ api, cache, owner: contract, useDefaultCoreAssets: true, blacklist, tokens: cCache.tokens, })
    }

    await setCache(project, api.chain, cache)
  }
}

module.exports = {
  methodology:
    `Counts each LP pair's native token and
   stable balance, adjusted to reflect locked pair's value.
   Balances and merged across multiple
   locker and staking contracts to return sum TVL per chain`,
  cronos: { tvl: tvl(cronosContractData) },
  polygon: { tvl: tvl(polygonContractData) },
  avax: { tvl: tvl(avalancheContractData) },
  kava: { tvl: tvl(kavaContractData) },
}
