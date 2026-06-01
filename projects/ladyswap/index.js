const { getUniTVL } = require('../helper/unknownTokens')

  const V2_FACTORY = '0x224531f8130A7F639444E17e1D43966dB1dEa431'
  const LCAKE = '0x8635dE218E5d4faC62432d6bfB20E199aeDe366F'
  const LADYCHEF = '0x09022c3e699B4DdCc9eDf52c9545F33783eB9F43'
  const LADYCHAIN_RPC = 'https://ladyrpc.us/rpc'
  const chain = 'ladychain'

  const tvl = getUniTVL({ chain, factory: V2_FACTORY, useDefaultCoreAssets: false })

  // Direct eth_call to bypass DefiLlama SDK multicall (no multicall contract on ladychain)
  async function stakingTvl(api) {
    const data = '0x70a08231' + LADYCHEF.replace('0x', '').padStart(64, '0').toLowerCase()
    const res = await fetch(LADYCHAIN_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', method: 'eth_call',
        params: [{ to: LCAKE, data }, 'latest'],
        id: 1,
      }),
    })
    const { result } = await res.json()
    api.add(LCAKE, result)
  }

  module.exports = {
    ladychain: {
      tvl,
      staking: stakingTvl,
    },
    methodology: 'TVL counts the liquidity across all LadySwap V2 trading pairs on LadyChain (chain 589). Staking counts LCAKE tokens deposited in the LadyChef contract.',
  }
  