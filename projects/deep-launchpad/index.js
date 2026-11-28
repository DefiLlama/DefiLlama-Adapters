const { PublicKey } = require('@solana/web3.js')
const ADDRESSES = require('../helper/coreAssets.json')
const { getConnection } = require('../helper/solana')

// DEEP launchpad: the Deep Curve bonding-curve program. Every launched token has one
// BondingCurve account (PDA ["curve", mint]) that holds what buyers paid in, in the curve's
// quote asset: SOL, or an approved SPL token such as DEEP (a token pair).
// At graduation the quote moves to a DeepSwap pool (counted by the deepswap adapter) and the
// program sets real_sol_reserves to 0, so a graduated curve adds nothing here.
const DEEP_CURVE_PROGRAM = '7czURwVLkQpcF1HVhhZU5GGzvPA8YniogZY1BhZHCDtA'

// Anchor discriminator of the account: sha256("account:BondingCurve")[0..8]
const BONDING_CURVE_DISCRIMINATOR = Buffer.from([23, 183, 248, 55, 96, 216, 172, 96])

// BondingCurve layout (borsh, after the 8-byte discriminator): mint 32 | creator 32 |
// virtual_sol_reserves u64 | virtual_token_reserves u64 | real_sol_reserves u64 @88 | ...
// The account has only ever grown by appended fields, so this offset holds for every version.
// A SOL curve is 196 bytes. A token-paired curve is 236 bytes: the same fields, whose `*_sol_*`
// amounts are in the quote token's base units, then quote_mint (32 bytes @196) and
// rent_quote_spent (u64 @228: quote already spent on the graduation rent, no longer held).
const OFFSET_REAL_SOL_RESERVES = 88
const OFFSET_QUOTE_MINT = 196
const OFFSET_RENT_QUOTE_SPENT = 228
const TOKEN_CURVE_SIZE = 236
const SLICE_LENGTH = TOKEN_CURVE_SIZE - OFFSET_REAL_SOL_RESERVES

async function tvl(api) {
  const connection = getConnection()
  // The slice is cut short to the account's own length, so a SOL curve returns 108 bytes.
  const curves = await connection.getProgramAccounts(new PublicKey(DEEP_CURVE_PROGRAM), {
    filters: [{ memcmp: { offset: 0, bytes: BONDING_CURVE_DISCRIMINATOR.toString('base64'), encoding: 'base64' } }],
    dataSlice: { offset: OFFSET_REAL_SOL_RESERVES, length: SLICE_LENGTH },
  })

  const byQuote = {}
  for (const { account } of curves) {
    const data = account.data
    let quote = ADDRESSES.solana.SOL
    let amount = data.readBigUInt64LE(0)
    if (data.length >= SLICE_LENGTH) {
      const mint = data.subarray(OFFSET_QUOTE_MINT - OFFSET_REAL_SOL_RESERVES, OFFSET_QUOTE_MINT - OFFSET_REAL_SOL_RESERVES + 32)
      // the default key (all zero bytes) is native SOL
      if (mint.some((b) => b !== 0)) quote = new PublicKey(mint).toString()
      const spent = data.readBigUInt64LE(OFFSET_RENT_QUOTE_SPENT - OFFSET_REAL_SOL_RESERVES)
      amount = amount > spent ? amount - spent : 0n
    }
    byQuote[quote] = (byQuote[quote] ?? 0n) + amount
  }

  for (const [quote, amount] of Object.entries(byQuote)) api.add(quote, amount.toString())
}

module.exports = {
  timetravel: false, // getProgramAccounts reads the current state only
  methodology:
    'TVL is what buyers have paid into the bonding curves of tokens that have not graduated yet, in each curve\'s quote asset (SOL, or an approved token such as DEEP): the sum of real_sol_reserves over every BondingCurve account of the Deep Curve program, less the quote a token-paired curve has already spent on its graduation rent, grouped by quote asset. Not counted: the curve\'s virtual reserves (a pricing parameter, not assets), the launched tokens still held by a curve (they have no market outside their own curve), trading fees and creator or holder rewards that sit on a curve account until they are claimed, and graduated tokens, whose liquidity is in a DeepSwap pool.',
  solana: { tvl },
}
