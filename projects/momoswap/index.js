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

// `Pool` starts with three fixed pubkeys + pool_id, then three variable-length
// strings (name/symbol/uri), so `payment_vault` and `state` are at data-dependent
// offsets — the account is allocated at a fixed size (the strings are space-reserved at
// their maximum lengths) but serialized at their real lengths, so a fixed offset would
// read garbage. Walk past the strings, then read the fixed tail. Layout (after the 8-byte
// discriminator): config(32) creator(32) creator_payment_account(32) pool_id(8)
// name(str) symbol(str) uri(str) token_mint(32) payment_mint(32) token_vault(32)
// payment_vault(32) launch_ts(8) end_ts(8) duration_secs(8) expiry_mode(1)
// migratable(1) anti_snipe(1) state(1) ...
function parsePool(data) {
  let o = 8 + 32 + 32 + 32 + 8 // skip discriminator + config + creator + creator_payment_account + pool_id
  for (let i = 0; i < 3; i++) { // name, symbol, uri
    if (o + 4 > data.length) return null
    o += 4 + data.readUInt32LE(o)
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
  for (const { account } of accounts) {
    // Re-check the discriminator: the program also owns `UserPosition` accounts, and an
    // RPC that ignored the memcmp filter would otherwise feed them to parsePool.
    if (account.data.subarray(0, 8).toString('hex') !== POOL_DISCRIMINATOR_HEX) continue
    const pool = parsePool(account.data)
    if (!pool) continue
    if (pool.state === POOL_STATE_GRADUATED) continue // graduated
    vaults.push(pool.paymentVault)
  }
  if (vaults.length) {
    const balances = await getTokenAccountBalances(vaults, { chain: api.chain, allowError: true })
    for (const [mint, amount] of Object.entries(balances)) api.add(mint, amount)
  }
}

module.exports = {
  timetravel: false,
  methodology: 'Counts the COOK held in the payment vault of every MomoSwap bonding-curve launch that has not graduated — launches still raising on the curve, plus expired launches whose raised COOK stays in the vault until participants claim it.',
  cookiechain: { tvl },
}
