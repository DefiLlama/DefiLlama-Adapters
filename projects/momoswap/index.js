const { PublicKey } = require('@solana/web3.js')
const { getConnection, getTokenAccountBalances } = require('../helper/solana')

// MomoSwap launchpad on Cookie Chain. Tokens launch on a bonding curve;
// the COOK raised from buyers is held in each pool's `payment_vault`
// TVL = COOK held in the payment vaults of pools that have not graduated,
// which includes expired pools: expiry snapshots the vault balance as
// `expiry_liquidity` and leaves the COOK in place for participants to claim.
const LAUNCHPAD = 'momoL7wu4TrXjnXMLCLzGsbx8Pm7XGgoYo7FVqDoqcw'

// Anchor account discriminator for `Pool` = sha256("account:Pool")[:8].
const POOL_DISCRIMINATOR_HEX = 'f19a6d0411b16dbc'
const POOL_DISCRIMINATOR_B58 = 'hQrXeCntzbV' // base58 of the 8 discriminator bytes, for the memcmp filter

// PoolState enum: 0 = Created, 1 = Open, 2 = Graduated, 3 = Expired.
const POOL_STATE_GRADUATED = 2

// The `Pool` account has had two layouts, and both are live on-chain.
//
// v2 (the original, now only expired test pools): three pubkeys + pool_id, then the
// variable-length strings name/symbol/uri, then the vaults — so `payment_vault` and
// `state` sat at data-dependent offsets and had to be found by walking the strings.
//
// v3 (every pool created since the reorder): all fixed-size fields were hoisted above the
// strings, which now sit LAST, so `payment_vault` is at a constant 200 and `state` at 267.
//
// Both are allocated at the same fixed size (875 bytes, strings space-reserved at their
// maximum lengths), so size can't tell them apart. The name length prefix can: in v3 it is
// at 493 and always non-zero, while in a v2 account byte 493 falls inside the reserved
// trailing padding and reads 0.
const V3_NAME_LEN_OFFSET = 493
const V3_PAYMENT_VAULT_OFFSET = 200
const V3_STATE_OFFSET = 267

function parsePool(data) {
  if (data.length < V3_NAME_LEN_OFFSET + 4) return null
  if (data.readUInt32LE(V3_NAME_LEN_OFFSET) !== 0) {
    return {
      paymentVault: new PublicKey(data.subarray(V3_PAYMENT_VAULT_OFFSET, V3_PAYMENT_VAULT_OFFSET + 32)).toBase58(),
      state: data[V3_STATE_OFFSET],
    }
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
  const stateOffset = o + 96 + 32 + 24 + 3 // skip payment_vault + launch/end/duration + expiry/migratable/anti_snipe
  if (stateOffset >= data.length) return null
  return {
    paymentVault: new PublicKey(data.subarray(paymentVaultOffset, paymentVaultOffset + 32)).toBase58(),
    state: data[stateOffset],
  }
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
    const pool = parsePool(account.data)
    if (!pool) throw new Error(`Unrecognised MomoSwap Pool layout: ${pubkey.toBase58()}`)
    if (pool.state === POOL_STATE_GRADUATED) continue // graduated
    vaults.push(pool.paymentVault)
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
  methodology: 'Counts the COOK held in the payment vault of every MomoSwap bonding-curve launch that has not graduated — launches still raising on the curve, plus expired launches whose raised COOK stays in the vault until participants claim it.',
  cookiechain: { tvl },
}
