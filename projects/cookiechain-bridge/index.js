const { sumTokens2 } = require('../helper/solana')

// Cookie Bridge moves COOK between Solana and Cookie Chain (a Solana / Agave fork)
// 1:1 — it is the same asset on both chains. TVL is measured on the canonical
// Solana side only (counting the mirrored Cookie Chain balance too would
// double-count the same COOK). This continues the bridge's original methodology
// ("COOK locked in the Solana bridge"), which counted the Squads multi-sig; with
// the migration to Hyperlane the bridge now also escrows COOK in a Hyperlane warp
// PDA on Solana, so that PDA is added alongside the multi-sig.

// SPL COOK (Token-2022, 6dp).
const SOLANA_COOK = '36ZrtQoab5MhhySaP1YSTwUahSk6GRVUTtZ6cuVfm9e1'
// Squads multi-sig that custodies bridge COOK (original bridge reserve).
const SQUADS_MULTISIG = 'DoYYCtcG2vfrE3HtxBBXiNVieMutvWBXsgbF3SKtYCyx'
// Hyperlane warp escrow token account (added with the Hyperlane migration).
const HYPERLANE_PDA = '88q7zoKctwAQRsoTxkMJy95sNE3tntuyEhSrhvR1eZwq'

async function tvl(api) {
  return sumTokens2({
    api,
    tokenAccounts: [HYPERLANE_PDA],                    // Hyperlane warp escrow (is itself the token account)
    tokensAndOwners: [[SOLANA_COOK, SQUADS_MULTISIG]], // Squads multi-sig -> its COOK account(s)
  })
}

module.exports = {
  timetravel: false,
  methodology:
    'TVL is the COOK locked in the bridge on Solana: SPL COOK held in the Hyperlane warp escrow PDA plus the Squads multi-sig that custodies the bridge reserve. COOK bridges 1:1 and is the same asset on Cookie Chain, so the mirrored Cookie Chain balances are not counted again.',
  solana: { tvl },
}
