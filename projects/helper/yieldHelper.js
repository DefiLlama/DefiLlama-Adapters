
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
      }

      const { output: poolLength } = await sdk.api.abi.call({
        target: masterchef,
        abi: abi.poolLength,
        chain, block,
      })

      log('Pool length: ', poolLength)

      let { output: poolInfos } = await sdk.api.abi.multiCall({
        target: masterchef,
        calls: getParamCalls(poolLength),
        abi: abi.poolInfo,
        chain, block,
      })

      poolInfos = poolInfos.filter(({ output }) =>
       !blacklistedTokens.includes(output.want.toLowerCase()) && !blacklistedTokens.includes(output.strat.toLowerCase()))
      
      const { output: lockedTotals } = await sdk.api.abi.multiCall({
        abi: abi.wantLockedTotal,
        calls: poolInfos.map(i => ({ target: i.output.strat})),
        chain, block,
      })
      
      const tokens = poolInfos.map(i => i.output.want.toLowerCase())
      const pairInfos = await getLPData({ chain, block, lps: tokens, })
      tokens.forEach((token, i) => {
        if (pairInfos[token] &&
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

      return balances
    }
  }

  return {
    [chain]: {
      tvl: async (_, _b, {[chain]: block}) => (await getAllTVL(block)).tvl, 
      pool2: async (_, _b, {[chain]: block}) => (await getAllTVL(block)).pool2, 
    }
  }
}

module.exports = { yieldHelper }