const { getConfig } = require('../helper/cache')
const ADDRESSES = require('../helper/coreAssets.json')

// Tempo's enshrined Stablecoin DEX is a system contract predeployed at a fixed
// address on every Tempo node. It is an on-chain limit-order book (CLOB) for
// swaps between TIP-20 stablecoins. All resting orders, escrowed bids/asks,
// and per-user maker balances live as TIP-20 token balances on this single
// contract, so TVL is the sum of every TIP-20 stablecoin held at the address.
//
//   Spec:      https://docs.tempo.xyz/protocol/exchange/spec
//   Predeploy: https://docs.tempo.xyz/quickstart/predeployed-contracts
const STABLECOIN_DEX = ADDRESSES.tempo.STABLECOIN_DEX

// Tempo's official Token List Registry (Uniswap-format JSON), maintained by
// the Tempo team. Pulling the token universe from a curated registry lets the
// adapter:
//
//   1. Self-update when a new TIP-20 stablecoin is registered (no code change).
//   2. Filter out test/joke TIP-20s that are not part of Tempo's curated set
//      (e.g. tokens like "DogePay", "ExploitUSD" that exist on-chain but were
//      never accepted into the registry). A raw on-chain enumeration would
//      otherwise pick those up and dramatically overstate TVL.
//
//   Spec:  https://docs.tempo.xyz/quickstart/tokenlist
const TEMPO_TOKENLIST = 'https://tokenlist.tempo.xyz/list/4217'

module.exports = {
  methodology:
    "TVL is the sum of every TIP-20 stablecoin balance held by Tempo's enshrined " +
    "Stablecoin DEX system contract at 0xdec0000000000000000000000000000000000000. " +
    "The token universe is read from Tempo's official Uniswap-format Token List " +
    "Registry (tokenlist.tempo.xyz/list/4217), so newly registered TIP-20 stablecoins " +
    "are picked up automatically while non-curated test/joke TIP-20s are excluded. " +
    "Tempo Zones (private execution) are NOT counted because they are testnet-only " +
    "as of mainnet 'Presto' launch (March 18, 2026); they will be added in a follow-up " +
    "once Zone Portal contracts ship on mainnet.",
  start: '2026-03-18',
  tempo: {
    tvl: async (api) => {
      const list = await getConfig('tempo-stable-dex/tokenlist', TEMPO_TOKENLIST)
      if (!Array.isArray(list?.tokens)) throw new Error('tempo-stable-dex: invalid token list, missing tokens[]')
      const tokens = list.tokens
        .map(t => t?.address)
        .filter(a => typeof a === 'string' && /^0x[a-fA-F0-9]{40}$/.test(a))
      if (!tokens.length) throw new Error('tempo-stable-dex: invalid token list, no valid token addresses')
      return api.sumTokens({ owner: STABLECOIN_DEX, tokens })
    }
  }
}
