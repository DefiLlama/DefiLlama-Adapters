const { getUniTVL } = require('../helper/unknownTokens')
  const { staking } = require('../helper/staking')

  const V2_FACTORY = '0x224531f8130A7F639444E17e1D43966dB1dEa431'
  const LCAKE = '0x8635dE218E5d4faC62432d6bfB20E199aeDe366F'
  const LADYCHEF = '0x09022c3e699B4DdCc9eDf52c9545F33783eB9F43'
  const chain = 'ladychain'

  const tvl = getUniTVL({ chain, factory: V2_FACTORY, useDefaultCoreAssets: false })

  module.exports = {
    ladychain: {
      tvl,
      staking: staking(LADYCHEF, LCAKE),
    },
    methodology: 'TVL counts the liquidity across all LadySwap V2 trading pairs on LadyChain (chain 589). Staking counts LCAKE tokens deposited in the LadyChef contract.',
  }
  