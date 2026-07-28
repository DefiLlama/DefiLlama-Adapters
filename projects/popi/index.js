const ADDRESSES = require('../helper/coreAssets.json')
const { getConnection, sumTokens2 } = require('../helper/solana')
const { PublicKey } = require('@solana/web3.js')

// popi (popi.wtf) — a gacha bonding-curve memecoin launchpad deployed on two
// chains with the SAME lifecycle. A launch raises the quote asset (ETH on
// Robinhood Chain, SOL on Solana) into an escrow while it is BONDING; when the
// curve reaches its graduation threshold the launch migrates and its liquidity
// is atomically moved OUT of popi into the chain's DEX (Uniswap v3 on Robinhood,
// PumpSwap on Solana). TVL here is therefore the quote asset still escrowed in
// popi for launches that have NOT yet graduated — i.e. value locked in live
// bonding curves. Graduated launches hold nothing in popi (their raise left for
// the DEX at migration), so they fall out of TVL automatically.

// ----------------------------------------------------------------------------
// Robinhood Chain (chainId 4663) — single UUPS proxy custodies every launch.
// ----------------------------------------------------------------------------
// Unlike per-launch clones, ALL popi launches on Robinhood live in ONE contract
// (the Solana single-program model, ported). Every bonding deposit is booked
// into that proxy's native-ETH balance (`totalBooked`); `migrate` subtracts the
// graduated launch's `claimableEth` from the proxy and sends it to the Uniswap
// v3 pool, and failed-launch refunds also leave the proxy. So the proxy's live
// native-ETH balance == Σ escrow of all still-bonding launches. Verified live:
// balance == totalBooked() to within ~1863 wei of dust.
const ROBIN_LAUNCHPAD = '0xae7f18c0d1a66aad8bfec77b0bbf779e03571b06'

async function robinhoodTvl(api) {
  // Native ETH held in the launchpad proxy. ADDRESSES.null (0x0) is priced as
  // the chain's gas token (ETH) by the SDK — same treatment rhfun uses for its
  // native bonding curves on this chain. WETH is not held at rest (migrate wraps
  // ammEth and forwards it to the pool in the same tx), so native ETH is the
  // whole escrow.
  return api.sumTokens({ tokensAndOwners: [[ADDRESSES.null, ROBIN_LAUNCHPAD]] })
}

// ----------------------------------------------------------------------------
// Solana (program BNtfydNwzthyGfH1LMxt5AzQkJo7iyfGFbjjNKuHFH6M) — per-launch
// vault PDA custodies each launch's SOL.
// ----------------------------------------------------------------------------
// Each launch has a System-owned vault PDA at seeds ["vault", launchPubkey] that
// holds the raised SOL. `migrate` drains that vault into the PumpSwap pool and
// flips phase -> Graduated (+ migrated = true); close_failed_launch closes the
// vault entirely. We enumerate live Launch accounts (Anchor discriminator), skip
// the Graduated ones, derive each survivor's vault PDA, and sum the vaults'
// native SOL via sumTokens2({ solOwners }).
const SOL_PROGRAM_ID = new PublicKey('BNtfydNwzthyGfH1LMxt5AzQkJo7iyfGFbjjNKuHFH6M')
// Anchor account discriminator for `Launch` = sha256("account:Launch")[..8],
// base58-encoded for the getProgramAccounts memcmp filter.
const LAUNCH_DISCRIMINATOR_B58 = 'R7vQE78exjo'
const PHASE_GRADUATED = 3 // Phase enum: 0 BondingCurve | 1 Settle | 2 Gacha | 3 Graduated

// Read the `phase` byte out of a borsh-serialized Launch account. Layout:
//   8 disc | 32 creator | 8 created_at | 8 created_at_slot |
//   (4+len) name | (4+len) symbol | (4+len) uri | 32 mint | 1 phase | ...
// name/symbol/uri are variable-length strings, so phase sits at a dynamic offset
// that we walk to. Returns 255 if the buffer is too short to parse (treated as
// non-graduated so its vault is still counted — fail safe, never drops funds).
function decodeLaunchPhase(data) {
  try {
    let o = 8 + 32 + 8 + 8
    o += 4 + data.readUInt32LE(o) // name
    o += 4 + data.readUInt32LE(o) // symbol
    o += 4 + data.readUInt32LE(o) // uri
    o += 32 // mint
    return data.readUInt8(o)
  } catch (e) {
    return 255
  }
}

async function solanaTvl(api) {
  const connection = getConnection()
  const accounts = await connection.getProgramAccounts(SOL_PROGRAM_ID, {
    filters: [{ memcmp: { offset: 0, bytes: LAUNCH_DISCRIMINATOR_B58 } }],
  })

  const vaults = []
  for (const { pubkey, account } of accounts) {
    if (decodeLaunchPhase(account.data) === PHASE_GRADUATED) continue // liquidity already on PumpSwap
    const [vault] = PublicKey.findProgramAddressSync(
      [Buffer.from('vault'), pubkey.toBuffer()],
      SOL_PROGRAM_ID,
    )
    vaults.push(vault.toString())
  }

  // Native SOL held across all live (non-graduated) launch vaults. Includes each
  // vault's tiny rent-exempt reserve (~0.00089 SOL) and any earmarked dev-fee /
  // community lamports physically parked in the vault, but is dominated by the
  // bonding-curve deposits.
  return sumTokens2({ api, solOwners: vaults })
}

module.exports = {
  // Solana TVL reads current program state (getProgramAccounts), which cannot be
  // queried historically, so this adapter does not support timetravel.
  timetravel: false,
  methodology:
    'popi is a bonding-curve memecoin launchpad on two chains. TVL is the quote asset escrowed in live (still-bonding, not-yet-graduated) launches. Robinhood Chain: all launches share one UUPS launchpad proxy (0xae7f18c0d1a66aad8bfec77b0bbf779e03571b06); we count the native ETH held by that proxy, which equals the sum of every bonding launch\'s escrow (migrate moves a graduated launch\'s liquidity out to the Uniswap v3 pool and failed-launch refunds leave the proxy, so only live escrow remains). Solana: each launch owns a System-owned vault PDA (seeds ["vault", launchPubkey]) under program BNtfydNwzthyGfH1LMxt5AzQkJo7iyfGFbjjNKuHFH6M; we enumerate Launch accounts, exclude Graduated ones (their SOL has already migrated to PumpSwap), and sum the native SOL in the surviving vaults. Launched tokens themselves and post-graduation DEX liquidity are not counted here.',
  robinhood: { tvl: robinhoodTvl },
  solana: { tvl: solanaTvl },
}
