const { PublicKey } = require('@solana/web3.js')
const ADDRESSES = require('../helper/coreAssets.json')
const { getConnection } = require('../helper/solana')

// DEEP launchpad: the Deep Curve bonding-curve program. Every launched token has one
// BondingCurve account (PDA ["curve", mint]) that holds the SOL buyers paid in.
// At graduation the SOL moves to a DeepSwap pool (counted by the deepswap adapter) and the
// program sets real_sol_reserves to 0, so a graduated curve adds nothing here.
const DEEP_CURVE_PROGRAM = '7czURwVLkQpcF1HVhhZU5GGzvPA8YniogZY1BhZHCDtA'

// Anchor discriminator of the account: sha256("account:BondingCurve")[0..8]
const BONDING_CURVE_DISCRIMINATOR = Buffer.from([23, 183, 248, 55, 96, 216, 172, 96])

// BondingCurve layout (borsh, after the 8-byte discriminator): mint 32 | creator 32 |
// virtual_sol_reserves u64 | virtual_token_reserves u64 | real_sol_reserves u64 @88 | ...
// The account has only ever grown by appended fields, so this offset holds for every version.
const OFFSET_REAL_SOL_RESERVES = 88

async function tvl(api) {
  const connection = getConnection()
  const curves = await connection.getProgramAccounts(new PublicKey(DEEP_CURVE_PROGRAM), {
    filters: [{ memcmp: { offset: 0, bytes: BONDING_CURVE_DISCRIMINATOR.toString('base64'), encoding: 'base64' } }],
    dataSlice: { offset: OFFSET_REAL_SOL_RESERVES, length: 8 },
  })

  let lamports = 0n
  for (const { account } of curves) lamports += account.data.readBigUInt64LE(0)

  api.add(ADDRESSES.solana.SOL, lamports.toString())
}

module.exports = {
  timetravel: false, // getProgramAccounts reads the current state only
  methodology:
    'TVL is the SOL that buyers have paid into the bonding curves of tokens that have not graduated yet: the sum of real_sol_reserves over every BondingCurve account of the Deep Curve program. Not counted: the curve\'s virtual reserves (a pricing parameter, not assets), the launched tokens still held by a curve (they have no market outside their own curve), trading fees and creator or holder rewards that sit on a curve account until they are claimed, and graduated tokens, whose liquidity is in a DeepSwap pool.',
  solana: { tvl },
}
