const ADDRESSES = require('./coreAssets.json')

const abi = require("../tenfinance/abi.json")
const { getUniqueAddresses, log, } = require('../helper/utils')
const { getLPData, } = require('../helper/unknownTokens')
const { getChainTransform, getFixBalancesSync, } = require('../helper/portedTokens')
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
}) {
  blacklistedTokens = getUniqueAddresses(blacklistedTokens)
  nativeTokens = getUniqueAddresses(blacklistedTokens)
  if (!project) throw new Error('Missing project name')
  if (nativeToken) nativeTokens = [nativeToken]

  async function getAllTVL(api) {
    const key = `${project}-${chain}-${api.block}`
    if (!allData[key]) allData[key] = _getAllTVL()
    return allData[key]

    async function _getAllTVL() {
      const transform = await getChainTransform(chain)
      const fixBalances = getFixBalancesSync(chain)
      const balances = {
        tvl: {},
        pool2: {},
        staking: {},
      }

      let poolInfos = await api.fetchList({
        lengthAbi: abis.poolLength || abi.poolLength,
        itemAbi: abis.poolInfo || abi.poolInfo,
        target: masterchef,
      })

      let _poolFilter = i => !blacklistedTokens.includes(i.want.toLowerCase()) && !blacklistedTokens.includes(i.strat.toLowerCase()) && i.strat !== ADDRESSES.null
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
      const pairInfos = await getLPData({ lps: tokens, ...api })
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
        unwrapLPsAuto({  api, balances: balances.tvl, transformAddress: transform, }),
        unwrapLPsAuto({  api, balances: balances.pool2, transformAddress: transform, }),
      ])

      fixBalances(balances.tvl)
      fixBalances(balances.pool2)
      fixBalances(balances.staking)

      return balances
    }
  }

  return {
    [chain]: {
      tvl: async (_, _b, _cb, { api }) => (await getAllTVL(api)).tvl,
      pool2: async (_, _b, _cb, { api }) => (await getAllTVL(api)).pool2,
      staking: async (_, _b, _cb, { api }) => (await getAllTVL(api)).staking,
    }
  }
}

module.exports = { yieldHelper }