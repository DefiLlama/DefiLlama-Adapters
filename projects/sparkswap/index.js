const { masterchefExports } = require('./helper/unknownTokens')
const { unwrapLPsAuto } = require('./helper/unwrapLPs')
const sdk = require('@defillama/sdk')

const MASTER_CHEF_CONTRACT = "0x2c8BBd2cecC77F2d18A04027Cc03CDB8Ab103214"

const abi = {
  poolInfo: "function poolInfo(uint256) view returns (address)",
  poolBalance: "function getSupply(uint256) view returns (uint256)",
}

const config = {
  pulse: {
    poolIds: [0, 1, 2, 3, 4, 5, 6, 7]
  },
}

module.exports = {};

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async (_, _b, { [chain]: block }, { api }) => {
      const balances = {}
      const { poolIds } = config[chain]
      const poolInfoCalls = poolIds.map((pid) => {
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
      const tokens = await Promise.all(poolInfoCalls.map((x) => api.call(x)))
      const bal = await Promise.all(balanceCalls.map((x) => api.call(x)))
      tokens.forEach((token, i) => sdk.util.sumSingleBalance(balances, `${chain}:${token}`, bal[i]))
      await unwrapLPsAuto({ balances, chain, block, })
      return balances
    }
  }
})
