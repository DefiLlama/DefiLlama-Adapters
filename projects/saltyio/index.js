

const { staking } = require('../helper/staking')

const config = {
  ethereum: { POOLS_CONFIG_CONTRACT: '0xA6ba8decE812f4663A19960735c0F66560a1D894', POOLS_CONTRACT: '0xf5D65d370141f1fff0Db646c9406Ce051354A8a5', }
}

const SALT_CONTRACT = '0x0110B0c3391584Ba24Dbf8017Bf462e9f78A6d9F'
const STAKING_CONTRACT = '0x7c6f5E73210080b093E724fbdB3EF7bcdd6D468b'

module.exports = {
  start: '2024-04-21',
}

Object.keys(config).forEach(chain => {
  const { POOLS_CONFIG_CONTRACT, POOLS_CONTRACT, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const poolIDs = await api.call({ abi: abi.whitelistedPools, target: POOLS_CONFIG_CONTRACT, })
      const tokens = await api.multiCall({ abi: abi.underlyingTokenPair, target: POOLS_CONFIG_CONTRACT, calls: poolIDs.map(i => i.poolID) })
      return api.sumTokens({ owner: POOLS_CONTRACT, tokens: tokens.flat() })
    }
  }
})

module.exports.ethereum.staking = staking(STAKING_CONTRACT, SALT_CONTRACT)

const abi = {
  "whitelistedPools": "function whitelistedPools() returns ( tuple(bytes32 poolID)[] )",
  "underlyingTokenPair": "function underlyingTokenPair( bytes32 poolID) returns ( address tokenA, address tokenB )",
}