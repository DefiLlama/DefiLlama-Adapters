const { getUniTVL } = require('../helper/unknownTokens')
  const { staking } = require('../helper/staking')

  const V2_FACTORY = '0x224531f8130A7F639444E17e1D43966dB1dEa431'
  const LCAKE = '0x8635dE218E5d4faC62432d6bfB20E199aeDe366F'
  const LADYCHEF = '0x09022c3e699B4DdCc9eDf52c9545F33783eB9F43'
  const chain = 'ladychain'

  // Configure LadyChain RPC and multicall for the DefiLlama SDK
  process.env.LADYCHAIN_RPC = 'https://ladyrpc.us/rpc'
  process.env.LADYCHAIN_RPC_MULTICALL = '0x36b580266BD2B9581B805BF99D0Db92FbC9CAa56'

  const tvl = getUniTVL({ chain, factory: V2_FACTORY, useDefaultCoreAssets: false })

  module.exports = {
    ladychain: {
      tvl,
      staking: staking(LADYCHEF, LCAKE, chain),
    },
    methodology: 'TVL counts the liquidity across all LadySwap V2 trading pairs on LadyChain (chain 589). Staking counts LCAKE tokens deposited in the LadyChef contract.',
  }
  