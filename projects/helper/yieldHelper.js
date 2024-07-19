const ADDRESSES = require('./coreAssets.json')

const abi = require("../tenfinance/abi.json")
const { getUniqueAddresses, } = require('../helper/utils')
const { getLPData, getTokenPrices } = require('../helper/unknownTokens')
const sdk = require('@defillama/sdk')
const { unwrapLPsAuto } = require("./unwrapLPs")

const allData = {}

function yieldHelper({
  project,
  chain,
  masterchef,
  blacklistedTokens = [],
  nativeToken,
  nativeTokens = [],
  abis = {},
  poolFilter,
  getPoolIds,
  getTokens,
  getTokenBalances,
  useDefaultCoreAssets = false,
  getPoolsFn,
}) {
  blacklistedTokens = getUniqueAddresses(blacklistedTokens)
  if (nativeToken) nativeTokens.push(nativeToken)
  nativeTokens = getUniqueAddresses(nativeTokens)
  if (!project) throw new Error('Missing project name')

  async function getAllTVL(api) {
    const key = `${project}-${chain}-${api.block}`
    if (!allData[key]) allData[key] = _getAllTVL()
    return allData[key]

    async function _getAllTVL() {
      const transform = i => `${chain}:${i.toLowerCase()}`
      const balances = {
        tvl: {},
        pool2: {},
        staking: {},
      }

      let poolInfos
      if (getPoolsFn) {
        poolInfos = await getPoolsFn(api)
      } else {
        poolInfos = await api.fetchList({
          lengthAbi: abis.poolLength || abi.poolLength,
          itemAbi: abis.poolInfo || abi.poolInfo,
          target: masterchef,
        })
      }

      let _poolFilter = i => !blacklistedTokens.includes(i.want.toLowerCase()) && !blacklistedTokens.includes(i.strat?.toLowerCase()) && i.strat !== ADDRESSES.null
      let _getPoolIds = i => i.strat

      if (getPoolIds) _getPoolIds = getPoolIds
      if (poolFilter) _poolFilter = poolFilter

      poolInfos = poolInfos.filter(_poolFilter)
      const poolIds = poolInfos.map(_getPoolIds)
      let lockedTotals

      if (getTokenBalances) {
        lockedTotals = await getTokenBalances({ api, poolInfos, poolIds, })
      } else {
        lockedTotals = await api.multiCall({
          abi: abis.wantLockedTotal || abi.wantLockedTotal,
          calls: poolIds,
        })
      }

      let tokens
      if (getTokens) {
        tokens = await getTokens({ poolInfos, api })
      }
      else tokens = poolInfos.map(i => i.want.toLowerCase())
      const pairInfos = await getLPData({ lps: tokens, ...api, abis, })
      const blacklistedSet = new Set(...(blacklistedTokens.map(i => i.toLowerCase())))
      tokens.forEach((token, i) => {
        if (nativeTokens.includes(token)) {
          sdk.util.sumSingleBalance(balances.staking, transform(token), lockedTotals[i])
        } else if (pairInfos[token] &&
          (nativeTokens.includes(pairInfos[token].token0Address) || nativeTokens.includes(pairInfos[token].token1Address))
        ) {
          sdk.util.sumSingleBalance(balances.pool2, transform(token), lockedTotals[i])
        } else {
          if (!blacklistedSet.has(token.toLowerCase()))
            sdk.util.sumSingleBalance(balances.tvl, transform(token), lockedTotals[i])
        }
      })

      await Promise.all([
        unwrapLPsAuto({ api, balances: balances.tvl, transformAddress: transform, abis, }),
        unwrapLPsAuto({ api, balances: balances.pool2, transformAddress: transform, abis, }),
      ])

      const lps = Object.keys(pairInfos)
      if (lps.length && useDefaultCoreAssets) {
        const { updateBalances } = await getTokenPrices({ lps, ...api, abis, useDefaultCoreAssets, })
        balances.tvl = await updateBalances(balances.tvl)
        balances.pool2 = await updateBalances(balances.pool2)
        balances.staking = await updateBalances(balances.staking)
      }

      return balances
    }
  }

  return {
    misrepresentedTokens: useDefaultCoreAssets,
    [chain]: {
      tvl: async (api) => (await getAllTVL(api)).tvl,
      pool2: async (api) => (await getAllTVL(api)).pool2,
      staking: async (api) => (await getAllTVL(api)).staking,
    }
  }
}

module.exports = { yieldHelper }