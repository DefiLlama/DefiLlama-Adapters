const { PublicKey } = require('@solana/web3.js')
const { getConnection, getTokenAccountBalances } = require('../helper/solana')

// MomoSwap launchpad on Cookie Chain. Tokens launch on a bonding curve;
// the COOK raised from buyers is held in each pool's `payment_vault`
// TVL = COOK held in the payment vaults of every pool, in any state:
//  - Created/Open: the live raise.
//  - Expired: expiry snapshots the vault balance as `expiry_liquidity` and
//    leaves the COOK in place for participants to claim.
//  - Graduated: `graduate_pool` sends only `raised - creator_vest - graduation_fee`
//    to the AMM migrator and LEAVES the creator vest (20% today) in the payment
//    vault, released linearly to the creator over `creator_vest_seconds`. That
//    remainder never reaches the AMM, so counting it cannot double-count the
//    cookieswap adapter's liquidity.
const LAUNCHPAD = 'momoL7wu4TrXjnXMLCLzGsbx8Pm7XGgoYo7FVqDoqcw'

// Anchor account discriminator for `Pool` = sha256("account:Pool")[:8].
const POOL_DISCRIMINATOR_HEX = 'f19a6d0411b16dbc'
const POOL_DISCRIMINATOR_B58 = 'hQrXeCntzbV' // base58 of the 8 discriminator bytes, for the memcmp filter

// The `Pool` account has had two layouts, and both are live on-chain.
//
// v2 (the original, now only expired test pools): three pubkeys + pool_id, then the
// variable-length strings name/symbol/uri, then the vaults — so `payment_vault` sat at a
// data-dependent offset and had to be found by walking the strings.
//
// v3 (every pool created since the reorder): all fixed-size fields were hoisted above the
// strings, which now sit LAST, so `payment_vault` is at a constant 200.
//
// Both are allocated at the same fixed size (875 bytes, strings space-reserved at their
// maximum lengths), so size can't tell them apart. The name length prefix can: in v3 it is
// at 493 and always non-zero, while in a v2 account byte 493 falls inside the reserved
// trailing padding and reads 0.
const V3_NAME_LEN_OFFSET = 493
const V3_PAYMENT_VAULT_OFFSET = 200

function parsePool(data) {
  if (data.length < V3_NAME_LEN_OFFSET + 4) return null
  if (data.readUInt32LE(V3_NAME_LEN_OFFSET) !== 0) {
    return new PublicKey(data.subarray(V3_PAYMENT_VAULT_OFFSET, V3_PAYMENT_VAULT_OFFSET + 32)).toBase58()
  }
  // v2: walk past the three strings from byte 112
  // (8 disc + config 32 + creator 32 + creator_payment_account 32 + pool_id 8).
  let o = 112
  for (let i = 0; i < 3; i++) { // name, symbol, uri
    if (o + 4 > data.length) return null
    const len = data.readUInt32LE(o)
    if (len > data.length) return null
    o += 4 + len
  }
  const paymentVaultOffset = o + 96 // skip token_mint + payment_mint + token_vault
  if (paymentVaultOffset + 32 > data.length) return null
  return new PublicKey(data.subarray(paymentVaultOffset, paymentVaultOffset + 32)).toBase58()
}

async function tvl(api) {
  const connection = getConnection(api.chain)
  const accounts = await connection.getProgramAccounts(new PublicKey(LAUNCHPAD), {
    filters: [{ memcmp: { offset: 0, bytes: POOL_DISCRIMINATOR_B58 } }],
  })
  const vaults = []
  for (const { pubkey, account } of accounts) {
    // Re-check the discriminator: the program also owns `UserPosition` accounts, and an
    // RPC that ignored the memcmp filter would otherwise feed them to parsePool.
    if (account.data.subarray(0, 8).toString('hex') !== POOL_DISCRIMINATOR_HEX) continue
    // Fail loudly: a `Pool` account the parser can't read means the struct changed again,
    // and silently skipping it under-reports TVL with no signal (exactly how the v3 reorder
    // went unnoticed).
    const paymentVault = parsePool(account.data)
    if (!paymentVault) throw new Error(`Unrecognised MomoSwap Pool layout: ${pubkey.toBase58()}`)
    vaults.push(paymentVault)
  }
  if (vaults.length) {
    // No `allowError`: every vault pubkey comes out of a live `Pool` account and the program never
    // closes a `payment_vault` (its only `close` is on `Session`, and it makes no `CloseAccount` CPI),
    // so a missing or undecodable vault means a bad RPC response or a struct-layout drift that broke
    // `parsePool` — both of which must fail loudly rather than silently under-report TVL.
    const balances = await getTokenAccountBalances(vaults, { chain: api.chain })
    // Every vault necessarily holds the same mint, so this loop yields a single entry: the singleton
    // `config` PDA (seeds ["config"], `init`-once, and `payment_mint` is never touched by
    // `update_config`) pins `create_pool`'s payment_mint via `address = config.payment_mint`, and the
    // payment_vault is `init`ed with `token::mint = payment_mint`. Today that mint is wrapped COOK.
    for (const [mint, amount] of Object.entries(balances)) api.add(mint, amount)
  }
}

module.exports = {
  timetravel: false,
  methodology: 'Counts the COOK held in the payment vault of every MomoSwap bonding-curve launch: launches still raising on the curve, expired launches whose raised COOK stays in the vault until participants claim it, and the unvested creator allocation that graduation withholds from the AMM migration and releases to the creator over time.',
  cookiechain: { tvl },
}
