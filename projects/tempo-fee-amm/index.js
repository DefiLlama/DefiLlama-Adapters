const { getConfig } = require('../helper/cache')
const ADDRESSES = require('../helper/coreAssets.json')

// Tempo's Fee Manager is a precompile predeployed at a fixed address on every
// Tempo node. It serves two roles on a single contract surface:
//
//   1. Fee AMM — a constant-product AMM with LP-backed pools that auto-convert
//      a user's chosen TIP-20 fee token into the validator's preferred TIP-20.
//      Liquidity providers earn 0.25% on conversions.
//   2. Validator fee escrow — collected fees are held here until the validator
//      requests distribution.
//
// Both surfaces share the same contract balance, so TVL is the sum of every
// TIP-20 stablecoin held at this address.
//
//   Source:    https://github.com/tempoxyz/tempo/tree/main/crates/precompiles/src/tip_fee_manager
//   Spec:      https://docs.tempo.xyz/protocol/fees/spec-fee-amm
//   Predeploy: https://docs.tempo.xyz/quickstart/predeployed-contracts
const FEE_MANAGER = ADDRESSES.tempo.FEE_MANAGER

// Same official registry used by the Stablecoin DEX adapter
// (projects/tempo-stable-dex/index.js).
const TEMPO_TOKENLIST = 'https://tokenlist.tempo.xyz/list/4217'

module.exports = {
  methodology:
    "TVL is the sum of every TIP-20 stablecoin balance held by Tempo's Fee Manager " +
    "precompile at 0xfeec000000000000000000000000000000000000. The Fee Manager " +
    "combines the Fee AMM (LP-backed pools that auto-convert user-chosen fee " +
    "tokens into validator-preferred tokens, 0.25% LP fee) with the validator " +
    "fee accounting layer (collected fees pending distribution). Both surfaces " +
    "live on the single precompile address, so a TIP-20 balance sweep captures " +
    "both. The token universe is read from Tempo's official Uniswap-format " +
    "Token List Registry (tokenlist.tempo.xyz/list/4217), which automatically " +
    "excludes non-curated test/joke TIP-20s. Tempo Zones (private execution) " +
    "have no Fee AMM exposure separate from this contract; Zones themselves " +
    "are testnet-only as of mainnet 'Presto' launch and are out of scope.",
  start: '2026-03-18', // Tempo mainnet "Presto" launch (chainId 4217)
  tempo: {
    tvl: async (api) => {
      const list = await getConfig('tempo-fee-amm/tokenlist', TEMPO_TOKENLIST)
      if (!Array.isArray(list?.tokens)) throw new Error('tempo-fee-amm: invalid token list, missing tokens[]')
      const tokens = [...new Set(
        list.tokens
          .map(t => t?.address)
          .filter(a => typeof a === 'string' && /^0x[a-fA-F0-9]{40}$/.test(a))
          .map(a => a.toLowerCase())
      )]
      if (!tokens.length) throw new Error('tempo-fee-amm: invalid token list, no valid token addresses')
      return api.sumTokens({ owner: FEE_MANAGER, tokens })
    }
  }
}
