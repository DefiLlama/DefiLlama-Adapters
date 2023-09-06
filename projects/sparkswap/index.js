const { getChainTransform, getFixBalances } = require('../helper/portedTokens')
const { getTokenPrices } = require('../helper/cache/sumUnknownTokens')
const sdk = require('@defillama/sdk')

const MASTER_CHEF_CONTRACT = "0x2c8BBd2cecC77F2d18A04027Cc03CDB8Ab103214"
const NATIVE_TOKEN = "0x6386704cD6f7A584EA9D23cccA66aF7EBA5a727e"
const NATIVE_LP_TOKEN = "0x1B044593a78E374bD0E558Aa6633D2ff13fD5Bb7"
const SPARKLER_CONTRACT = "0x7b1C460d0Ad91c8A453B7b0DBc0Ae4F300423FFB"

const abi = {
  poolInfo: "function poolInfo(uint256) view returns (address)",
  poolBalance: "function getSupply(uint256) view returns (uint256)",
  erc20Balance: "erc20:balanceOf",
}

const config = {
  pulse: {
    poolIds: [0, 1, 2, 3, 4, 5, 6, 7],
  },
}

module.exports = {};

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async (_, _b, { [chain]: block }, { api }) => {
      const { poolIds } = config[chain]
      const balances = {}
      const tokenCalls = poolIds.map((pid) => {
        return {
          abi: abi.poolInfo,
          target: MASTER_CHEF_CONTRACT,
          params: [pid],
        }
      })
      const balanceCalls = poolIds.map((pid) => {
        return {
          abi: abi.poolBalance,
          target: MASTER_CHEF_CONTRACT,
          params: [pid],
        }
      })
      balanceCalls.push({
        abi: abi.erc20Balance,
        target: NATIVE_TOKEN,
        params: [SPARKLER_CONTRACT]
      })
      balanceCalls.push({
        abi: abi.erc20Balance,
        target: NATIVE_LP_TOKEN,
        params: [SPARKLER_CONTRACT]
      })
      
      const fixBalances = await getFixBalances(chain)
      const transform = await getChainTransform(chain)
      const tokenList = await Promise.all(tokenCalls.map((x) => api.call(x)))
      const balanceList = await Promise.all(balanceCalls.map((x) => api.call(x)))
      
      tokenList.forEach((token, i) => sdk.util.sumSingleBalance(balances, transform(token), balanceList[i]))
      sdk.util.sumSingleBalance(balances, transform(NATIVE_TOKEN), balanceList[balanceList.length - 2])
      sdk.util.sumSingleBalance(balances, transform(NATIVE_LP_TOKEN), balanceList[balanceList.length - 1])

      const { updateBalances } = await getTokenPrices({ lps: tokenList, useDefaultCoreAssets: true, block, chain, minLPRatio: 0.001, })

      await updateBalances(balances)
      fixBalances(balances)

      return balances
    }
  }
})
