const { getProvider } = require('../helper/solana')
const { decodeAccount } = require('../helper/utils/solana/layout')
const { PublicKey } = require('@solana/web3.js')

async function tvl(api) {
  const provider = getProvider(api.chain)
  let stakePoolAddress = 'ign1zuR3YsvLVsEu8WzsyazBA8EVWUxPPHKnhqhoSTB'

  // Follow the same pattern as other Solana LST adapters
  if (typeof stakePoolAddress === 'string') stakePoolAddress = new PublicKey(stakePoolAddress)
  const accountInfo = await provider.connection.getAccountInfo(stakePoolAddress);

  if (accountInfo) {
    try {
      const deserializedAccountInfo = decodeAccount('stakePool', accountInfo)

      if (deserializedAccountInfo && deserializedAccountInfo.totalLamports) {
        const totalStakedLamports = +deserializedAccountInfo.totalLamports
        const fogoTokens = totalStakedLamports / 1e9

        return {
          "coingecko:fogo": fogoTokens
        }
      }
    } catch (error) {
      console.log('Failed to decode stake pool account:', error.message)
    }
  }

  return {}
}

module.exports = {
  timetravel: false,
  fogo: {
    tvl
  }
}