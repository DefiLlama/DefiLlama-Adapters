const { PublicKey } = require('@solana/web3.js')
const { getConnection } = require('../helper/solana')

// PiggyBank Token vaults. Add a line here when a new vault is launched.
const VAULTS = [
  '91LYov1N1j62Q3ipuBi8w2e5GVqjVxWTdJ757roiWXdy', // pbUSDC    -> USDC
  '5CgRTdywEQ7LK7SRM5NAgsuSWxnswREW6VeZ4i9jHCRf', // pbSPYx    -> SPYx (xStock)
  '6mzgN6fyqap4Um7bNoH7DNCqtib3CU7TfGvVTMBhaDhf', // pbJITOSOL -> JitoSOL
]

const DISCRIMINATOR = Buffer.from('PBKTOKEN')
const PBK_TOKEN_LEN = 210

// PbkToken layout (#[repr(C)], all fields are byte arrays so no padding):
//   0   discriminator [8]
//   8   mint                   [32]   share/LST mint
//   40  underlying_mint        [32]
//   72  lst_supply             u128
//   88  epoch                  u64
//   96  prev_epoch_redemptions u128
//   112 epoch_redemptions      u128
//   128 epoch_deposits         u128
//   144 pending_redemptions    u128
//   160 pending_claims         u128
//   176 managed                u128
//   192 deposit_cap            u128
//   208 state                  u8
//   209 bump                   u8
function readU128LE(data, offset) {
  return data.readBigUInt64LE(offset) | (data.readBigUInt64LE(offset + 8) << 64n)
}

function decodePbkToken(data) {
  if (!data || data.length !== PBK_TOKEN_LEN) return null
  if (!data.slice(0, 8).equals(DISCRIMINATOR)) return null

  const underlyingMint = new PublicKey(data.slice(40, 72)).toString()
  const prevEpochRedemptions = readU128LE(data, 96)
  const epochRedemptions = readU128LE(data, 112)
  const epochDeposits = readU128LE(data, 128)
  const pendingRedemptions = readU128LE(data, 144)
  const managed = readU128LE(data, 176)

  // Mirrors on-chain underlying_represented_by_lst()
  const underlying = managed + epochDeposits - epochRedemptions - prevEpochRedemptions - pendingRedemptions

  return { underlyingMint, underlying}
}

async function tvl(api) {
  const accounts = await getConnection().getMultipleAccountsInfo(
    VAULTS.map((v) => new PublicKey(v)),
  )

  for (const account of accounts) {
    const decoded = decodePbkToken(account?.data)
    if (!decoded) continue
    const { underlyingMint, underlying } = decoded
    if (underlying > 0n) api.add(underlyingMint, underlying.toString())
  }
}

module.exports = {
  timetravel: false,
  methodology:
    'PiggyBank issues vault share tokens (e.g. pbUSDC, pbJitoSOL, pbSPYx) representing deposits in an underlying token. For each vault, the adapter reads the on-chain account and calculates total underlying by summing managed and epochDeposits values and subtracting all redemptions.',
  solana: { tvl },
}