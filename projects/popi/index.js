const ADDRESSES = require('../helper/coreAssets.json')
const { getConnection, sumTokens2 } = require('../helper/solana')
const { PublicKey } = require('@solana/web3.js')

const ROBIN_LAUNCHPAD = '0xae7f18c0d1a66aad8bfec77b0bbf779e03571b06'

async function robinhoodTvl(api) {
  return api.sumTokens({ tokensAndOwners: [[ADDRESSES.null, ROBIN_LAUNCHPAD]] })
}

const SOL_PROGRAM_ID = new PublicKey('BNtfydNwzthyGfH1LMxt5AzQkJo7iyfGFbjjNKuHFH6M')
// Anchor account discriminator for `Launch` = sha256("account:Launch")[..8],
// base58-encoded for the getProgramAccounts memcmp filter.
const LAUNCH_DISCRIMINATOR_B58 = 'R7vQE78exjo'
const PHASE_GRADUATED = 3 // Phase enum: 0 BondingCurve | 1 Settle | 2 Gacha | 3 Graduated

// Read the `phase` byte out of a borsh-serialized Launch account. Layout:
//   8 disc | 32 creator | 8 created_at | 8 created_at_slot |
//   (4+len) name | (4+len) symbol | (4+len) uri | 32 mint | 1 phase | ...
// name/symbol/uri are variable-length strings, so phase sits at a dynamic offset that we walk to.
function decodeLaunchPhase(data) {
  let o = 8 + 32 + 8 + 8
  o += 4 + data.readUInt32LE(o) // name
  o += 4 + data.readUInt32LE(o) // symbol
  o += 4 + data.readUInt32LE(o) // uri
  o += 32 // mint
  return data.readUInt8(o)
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

  return sumTokens2({ api, solOwners: vaults })
}

module.exports = {
  timetravel: false,
  methodology: 'popi is a bonding-curve memecoin launchpad on two chains. TVL is the quote asset escrowed in live (still-bonding, not-yet-graduated) launches. Robinhood Chain: we count the native ETH held by the shared UUPS launchpad proxy, which equals the sum of every bonding launch\'s escrow excluding graduated funds (migrated to Uniswap). Solana: each launch owns a System-owned vault PDA (seeds ["vault", launchPubkey]); we enumerate Launch accounts, exclude Graduated ones (migrated to PumpSwap), and sum the native SOL in the surviving vaults. Launched tokens themselves and post-graduation DEX liquidity are not counted here.',
  robinhood: { tvl: robinhoodTvl },
  solana: { tvl: solanaTvl },
}
