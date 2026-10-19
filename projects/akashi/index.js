const { PublicKey } = require('@solana/web3.js')
const bs58 = require('bs58').default || require('bs58')
const { getConnection, sumTokens2, TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } = require('../helper/solana')

// Akashi vaults: Senior/Junior USDC vaults whose deposits the vault program allocates to
// lending and credit protocols through adapter programs. Each vault keeps its cash in
// two token accounts (idle, and payout for funded withdrawals not yet claimed); each leg
// holds its protocol receipt token (jlUSDC, Kamino cTokens, syrupUSDC, PRIME, AUTO, PST)
// and a USDC transit account, all owned by the leg's authority PDA.
const PROGRAM_ID = new PublicKey('11pvmug4MazGHegPLFYn7RxSwoV7AkFF1LSbbNJ1QyF')

// sha256("account:Vault")[0..8]
const VAULT_DISCRIMINATOR = Buffer.from([211, 8, 232, 43, 2, 152, 117, 119])

// Vault layout (Anchor/borsh, after the 8-byte discriminator):
//   vault_id u64, admin Pubkey,
//   params { executor Pubkey, min_coverage_bps u16, max_coverage_bps u16,
//            premium_curve Vec<{u16,u16}>, senior_delay_secs u32, junior_notice_secs u32,
//            min_deposit u64, vault_cap u64, idle_target_bps u16, idle_min_bps u16,
//            max_valuation_age_slots u64, junior_seed u64 },
//   state u8, usdc_mint, senior_mint, junior_mint, idle_account, payout_account,
//   senior_escrow, junior_escrow (Pubkey each), accounts_initialized bool, leg_count u8, ...
const PREMIUM_CURVE_LEN = 8 + 8 + 32 + 32 + 2 + 2 // offset of the curve's u32 length
const MAX_CURVE_POINTS = 4 // #[max_len(4)] in state.rs
const AFTER_CURVE = 4 + 4 + 8 + 8 + 2 + 2 + 8 + 8 // rest of params
const MAX_LEGS = 8

function decodeVault(address, data) {
  let offset = PREMIUM_CURVE_LEN
  const curveLen = data.readUInt32LE(offset)
  if (curveLen > MAX_CURVE_POINTS) throw new Error(`akashi: unexpected Vault layout at ${address} (premium curve length ${curveLen})`)
  offset += 4 + curveLen * 4 + AFTER_CURVE + 1 // + state
  const key = (i) => new PublicKey(data.subarray(offset + 32 * i, offset + 32 * (i + 1))).toBase58()
  const idleAccount = key(3)
  const payoutAccount = key(4)
  // false until init_vault_accounts runs: the account keys are still zero and the vault holds nothing
  const accountsInitialized = data[offset + 32 * 7] === 1
  const legCount = data[offset + 32 * 7 + 1]
  if (legCount > MAX_LEGS) throw new Error(`akashi: unexpected Vault layout at ${address} (leg count ${legCount})`)
  return { idleAccount, payoutAccount, accountsInitialized, legCount }
}

const legAuthority = (vault, index) =>
  PublicKey.findProgramAddressSync([Buffer.from('leg_auth'), vault.toBuffer(), Buffer.from([index])], PROGRAM_ID)[0].toBase58()

async function tvl(api) {
  const connection = getConnection()
  const vaults = await connection.getProgramAccounts(PROGRAM_ID, {
    filters: [{ memcmp: { offset: 0, bytes: bs58.encode(VAULT_DISCRIMINATOR) } }],
  })
  const tokenAccounts = []
  const legAuthorities = []
  for (const { pubkey, account } of vaults) {
    const { idleAccount, payoutAccount, accountsInitialized, legCount } = decodeVault(pubkey.toBase58(), account.data)
    if (!accountsInitialized) continue
    tokenAccounts.push(idleAccount, payoutAccount)
    for (let i = 0; i < legCount; i++) legAuthorities.push(legAuthority(pubkey, i))
  }
  // list each leg authority's token accounts ourselves so an RPC failure fails the run
  // instead of silently dropping a leg
  for (const owner of legAuthorities)
    for (const programId of [TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID]) {
      const { value } = await connection.getTokenAccountsByOwner(new PublicKey(owner), { programId })
      tokenAccounts.push(...value.map(({ pubkey }) => pubkey.toBase58()))
    }
  return sumTokens2({ api, tokenAccounts })
}

module.exports = {
  timetravel: false,
  doublecounted: true, // the legs' receipt tokens are deposits in Kamino Lend, Jupiter Lend, Maple, Hastra and Huma
  methodology: 'Token balances held by every Akashi vault: USDC in each vault\'s idle and payout accounts (payout holds funded withdrawals not yet claimed), plus the protocol receipt tokens and USDC held by each leg\'s authority (jlUSDC, Kamino reserve cTokens, syrupUSDC, Hastra PRIME/AUTO, Huma PST). Those positions are also counted by Kamino Lend, Jupiter Lend, Maple, Hastra and Huma, so the TVL is marked double counted. An async exit still pending at the protocol (e.g. a Huma redemption request) holds no token and is counted once it settles.',
  solana: { tvl },
}
