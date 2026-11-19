const ADDRESSES = require('../helper/coreAssets.json')
const { PublicKey } = require('@solana/web3.js')
const { getConnection, sumTokens2 } = require('../helper/solana')

// Cookie Bridge moves COOK between Solana and Cookie Chain (a Solana / Agave fork)
// 1:1 via a Hyperlane collateral<->collateral warp route: SPL COOK is locked in a
// warp escrow on Solana and native COOK is locked in a warp PDA on Cookie Chain,
// and the relayer releases from the other side's escrow. The two escrows are two
// halves of one inventory pool, so each side is counted on its own chain — those
// are distinct token units and no COOK is counted twice. Counting only one side
// would instead make TVL rise and fall with the direction users happen to bridge.
//
// Alongside the escrows the bridge reserve is custodied in a Squads multi-sig on
// each chain, mirroring the same undistributed COOK. Only the Solana multi-sig is
// counted (as the bridge's original methodology, "COOK locked in the Solana
// bridge", always did); adding the Cookie Chain one would double-count that reserve.

// SPL COOK (Token-2022, 6dp).
const SOLANA_COOK = '36ZrtQoab5MhhySaP1YSTwUahSk6GRVUTtZ6cuVfm9e1'
// Squads multi-sig that custodies bridge COOK (original bridge reserve).
const SQUADS_MULTISIG = 'DoYYCtcG2vfrE3HtxBBXiNVieMutvWBXsgbF3SKtYCyx'
// Hyperlane warp escrow token account (added with the Hyperlane migration).
const HYPERLANE_PDA = '88q7zoKctwAQRsoTxkMJy95sNE3tntuyEhSrhvR1eZwq'

// Cookie Chain side: Hyperlane warp PDA holding native COOK.
const COOKIECHAIN_HYPERLANE_PDA = 'CL2JoQ5jdTpRNKshWhaTihuooT4qrKdLUiPsqKj3yAKz'
// Native COOK is priced under the wrapped mint address (Solana fork -> same address
// as wrapped SOL), 9dp.
const COOKIECHAIN_COOK = ADDRESSES.solana.SOL

async function solanaTvl(api) {
  return sumTokens2({
    api,
    tokenAccounts: [HYPERLANE_PDA],                    // Hyperlane warp escrow (is itself the token account)
    tokensAndOwners: [[SOLANA_COOK, SQUADS_MULTISIG]], // Squads multi-sig -> its COOK account(s)
  })
}

async function cookiechainTvl(api) {
  // Read the native balance straight off the chain's connection: sumTokens2's
  // `solOwners` path resolves its connection without a chain and would read Solana.
  const balance = await getConnection(api.chain).getBalance(new PublicKey(COOKIECHAIN_HYPERLANE_PDA))
  api.add(COOKIECHAIN_COOK, balance)
}

module.exports = {
  timetravel: false,
  methodology:
    'TVL is the COOK locked in the bridge on both sides: the Hyperlane warp escrow and the Squads reserve multi-sig on Solana, plus the Hyperlane warp PDA on Cookie Chain. The mirrored Cookie Chain reserve multi-sig is excluded, so the same reserve is not counted twice.',
  solana: { tvl: solanaTvl },
  cookiechain: { tvl: cookiechainTvl },
}
