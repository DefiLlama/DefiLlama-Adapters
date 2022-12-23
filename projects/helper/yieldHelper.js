
const abi = require("../tenfinance/abi.json")
const { getParamCalls, getUniqueAddresses, log, } = require('../helper/utils')
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

  async function getAllTVL(block) {
    const key = `${project}-${chain}-${block}`
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

      const { output: poolLength } = await sdk.api.abi.call({
        target: masterchef,
        abi: abis.poolLength || abi.poolLength,
        chain, block,
      })

      log('Pool length: ', poolLength)

      let { output: poolInfos } = await sdk.api.abi.multiCall({
        target: masterchef,
        calls: getParamCalls(poolLength),
        abi: abis.poolInfo || abi.poolInfo,
        chain, block,
      })

      let _poolFilter = ({ output }) => !blacklistedTokens.includes(output.want.toLowerCase()) && !blacklistedTokens.includes(output.strat.toLowerCase())
      let _getPoolIds = i => i.output.strat

      if (getPoolIds) _getPoolIds = getPoolIds
      if (poolFilter) _poolFilter = poolFilter

      poolInfos = poolInfos.filter(_poolFilter)
      const poolIds = poolInfos.map(_getPoolIds)
      let lockedTotals

      if (getTokenBalances) {
        lockedTotals = await getTokenBalances({ chain, block, poolInfos, poolIds, })
      } else {
        const res = await sdk.api.abi.multiCall({
          abi: abis.wantLockedTotal || abi.wantLockedTotal,
          calls: poolIds.map(i => ({ target: i})),
          chain, block,
        })
        lockedTotals = res.output
      }

      let tokens
      if (getTokens)  tokens = await getTokens({ poolInfos, chain, block, })
      else tokens = poolInfos.map(i => i.output.want.toLowerCase())
      const pairInfos = await getLPData({ chain, block, lps: tokens, })
      tokens.forEach((token, i) => {
        if (nativeTokens.includes(token)) {
          sdk.util.sumSingleBalance(balances.staking,transform(token),lockedTotals[i].output)
        } else if (pairInfos[token] &&
          (nativeTokens.includes(pairInfos[token].token0Address) || nativeTokens.includes(pairInfos[token].token1Address))
        ) {
          sdk.util.sumSingleBalance(balances.pool2, transform(token), lockedTotals[i].output)
        } else {
          sdk.util.sumSingleBalance(balances.tvl, transform(token), lockedTotals[i].output)
        }
      })

      await Promise.all([
        unwrapLPsAuto({ balances: balances.tvl, chain, block, transformAddress: transform, }),
        unwrapLPsAuto({ balances: balances.pool2, chain, block, transformAddress: transform, }),
      ])

      fixBalances(balances.tvl)
      fixBalances(balances.pool2)
      fixBalances(balances.staking)

      return balances
    }
  }

  return {
    [chain]: {
      tvl: async (_, _b, { [chain]: block }) => (await getAllTVL(block)).tvl,
      pool2: async (_, _b, { [chain]: block }) => (await getAllTVL(block)).pool2,
      staking: async (_, _b, { [chain]: block }) => (await getAllTVL(block)).staking,
    }
  }
}

module.exports = { yieldHelper }