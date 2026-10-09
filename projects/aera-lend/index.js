const ADDRESSES = require('../helper/coreAssets.json')
const { PublicKey } = require('@solana/web3.js')
const { getConnection, getTokenAccountBalances } = require('../helper/solana')

// Aera Lend is an overcollateralized money market on Cookie Chain: users lend COOK, and
// borrow COOK against bCOOK (BakeYourStake's liquid staking token) posted as collateral.
//
// Every asset sits in one `Reserve` account per mint. Each reserve keeps its tokens in a
// single `liquidity_vault` token account (PDA ["liquidity_vault", reserve], owned by the
// reserve), so TVL is the balance of those vaults: idle COOK that lenders supplied, plus
// all bCOOK collateral. Borrowed COOK has left the vault and is reported under `borrowed`.
const PROGRAM = new PublicKey('AerafpFHsY4N16i4KufPJQyURryxKtYgCr6oZMwbp76q')

// Anchor discriminator for `Reserve` = sha256("account:Reserve")[:8] = 2bf2ccca1af73b7f.
const RESERVE_DISCRIMINATOR_HEX = '2bf2ccca1af73b7f'
const RESERVE_DISCRIMINATOR_B58 = '8MMas8GHex6'

// `Reserve` layout (IDL order, after the 8-byte discriminator):
// market 8, liquidity_mint 40, liquidity_vault 72, share_mint 104, oracle 136,
// liquidity_decimals 168 (u8), available_liquidity 169 (u64), share_mint_supply 177 (u64),
// borrowed_principal 185 (u128), borrow_index 201 (u128, 1e18 fixed point),
// last_update_slot 217 (u64), accrued_fees 225 (u64), then `ReserveConfig` from 233:
// 11 u16 bps fields (optimal_utilization 243, min/optimal/max_borrow_rate 245/247/249),
// supply/borrow/per-wallet caps (3 u64), 3 bools, slots_per_year 282 (u64).
const LIQUIDITY_MINT_OFFSET = 40
const LIQUIDITY_VAULT_OFFSET = 72
const AVAILABLE_LIQUIDITY_OFFSET = 169
const BORROWED_PRINCIPAL_OFFSET = 185
const BORROW_INDEX_OFFSET = 201
const LAST_UPDATE_SLOT_OFFSET = 217
const OPTIMAL_UTILIZATION_OFFSET = 243
const MIN_BORROW_RATE_OFFSET = 245
const OPTIMAL_BORROW_RATE_OFFSET = 247
const MAX_BORROW_RATE_OFFSET = 249
const SLOTS_PER_YEAR_OFFSET = 282
const RESERVE_MIN_LEN = SLOTS_PER_YEAR_OFFSET + 8
const FIXED_POINT_SCALE = 10n ** 18n
const BPS = 10_000n

// bCOOK has no price feed, so collateral is valued as the native COOK it redeems for:
// the BakeYourStake SPL stake pool's totalLamports / poolTokenSupply, the same account the
// bakeyourstake adapter reads. Both mints have 9 decimals.
const BCOOK = 'EkPafx58mgwkEnGwo62jXhXDAdJ37Z8G8MFBRPsr9uhz'
const STAKE_POOL = new PublicKey('GxbNKNYdtNXQkhDkpHdLDAMX64GxaECgANqdfp6cUGH4')
const STAKE_POOL_MINT_OFFSET = 162
const TOTAL_LAMPORTS_OFFSET = 258
const POOL_TOKEN_SUPPLY_OFFSET = 266
const COOK = ADDRESSES.solana.SOL // native COOK

const readU128 = (data, offset) => data.readBigUInt64LE(offset) + (data.readBigUInt64LE(offset + 8) << 64n)
const readU16 = (data, offset) => BigInt(data.readUInt16LE(offset))

// `Reserve::current_borrowed_amount`: principal x index, rounded up.
const debtAt = (principal, index) => (principal * index + FIXED_POINT_SCALE - 1n) / FIXED_POINT_SCALE

// The stored borrow_index only advances when a transaction runs `accrue_interest`, so the
// debt is projected to the current slot exactly as the program would accrue it:
// index x (1 + rate_per_slot x elapsed), with the rate from the kinked utilization curve.
function currentDebt(data, principal, slot) {
  const index = readU128(data, BORROW_INDEX_OFFSET)
  const lastUpdateSlot = data.readBigUInt64LE(LAST_UPDATE_SLOT_OFFSET)
  const borrowed = debtAt(principal, index)
  if (principal === 0n || slot <= lastUpdateSlot) return borrowed

  const gross = data.readBigUInt64LE(AVAILABLE_LIQUIDITY_OFFSET) + borrowed
  const utilization = gross === 0n ? 0n : (borrowed * BPS) / gross
  const kink = readU16(data, OPTIMAL_UTILIZATION_OFFSET)
  const minRate = readU16(data, MIN_BORROW_RATE_OFFSET)
  const optimalRate = readU16(data, OPTIMAL_BORROW_RATE_OFFSET)
  const maxRate = readU16(data, MAX_BORROW_RATE_OFFSET)
  const rateBps = utilization <= kink
    ? minRate + ((optimalRate - minRate) * utilization) / kink
    : optimalRate + ((maxRate - optimalRate) * (utilization - kink)) / (BPS - kink)
  const ratePerSlot = (rateBps * FIXED_POINT_SCALE) / (BPS * data.readBigUInt64LE(SLOTS_PER_YEAR_OFFSET))
  const growth = FIXED_POINT_SCALE + ratePerSlot * (slot - lastUpdateSlot)
  return debtAt(principal, (index * growth) / FIXED_POINT_SCALE)
}

async function getReserves(connection) {
  const [accounts, slot] = await Promise.all([
    connection.getProgramAccounts(PROGRAM, {
      filters: [{ memcmp: { offset: 0, bytes: RESERVE_DISCRIMINATOR_B58 } }],
    }),
    connection.getSlot(),
  ])
  const reserves = []
  for (const { pubkey, account } of accounts) {
    const data = account.data
    if (data.subarray(0, 8).toString('hex') !== RESERVE_DISCRIMINATOR_HEX) continue
    if (data.length < RESERVE_MIN_LEN) throw new Error(`Unrecognised Aera Reserve layout: ${pubkey.toBase58()}`)
    reserves.push({
      mint: new PublicKey(data.subarray(LIQUIDITY_MINT_OFFSET, LIQUIDITY_MINT_OFFSET + 32)).toBase58(),
      vault: new PublicKey(data.subarray(LIQUIDITY_VAULT_OFFSET, LIQUIDITY_VAULT_OFFSET + 32)).toBase58(),
      borrowed: currentDebt(data, readU128(data, BORROWED_PRINCIPAL_OFFSET), BigInt(slot)),
    })
  }
  // The program is live with a COOK and a bCOOK reserve; finding none means a bad RPC
  // response or a layout change, and must not be reported as zero TVL.
  if (!reserves.length) throw new Error('aera-lend: no Reserve accounts found')
  return reserves
}

// Returns a function that adds `amount` of `mint`, converting bCOOK into native COOK.
async function getAdder(connection, api) {
  const acc = await connection.getAccountInfo(STAKE_POOL)
  if (!acc || acc.data.length < POOL_TOKEN_SUPPLY_OFFSET + 8)
    throw new Error('aera-lend: bCOOK stake pool account missing or malformed')
  const poolMint = new PublicKey(acc.data.subarray(STAKE_POOL_MINT_OFFSET, STAKE_POOL_MINT_OFFSET + 32)).toBase58()
  if (poolMint !== BCOOK) throw new Error(`aera-lend: stake pool mint is ${poolMint}, expected bCOOK`)
  const totalLamports = acc.data.readBigUInt64LE(TOTAL_LAMPORTS_OFFSET)
  const poolTokenSupply = acc.data.readBigUInt64LE(POOL_TOKEN_SUPPLY_OFFSET)
  if (poolTokenSupply === 0n) throw new Error('aera-lend: bCOOK stake pool has no supply')

  return (mint, amount) => {
    amount = BigInt(amount)
    if (amount === 0n) return
    if (mint === BCOOK) api.add(COOK, ((amount * totalLamports) / poolTokenSupply).toString())
    else api.add(mint, amount.toString())
  }
}

async function tvl(api) {
  const connection = getConnection(api.chain)
  const reserves = await getReserves(connection)
  const add = await getAdder(connection, api)
  // No `allowError`: every vault comes out of a live Reserve and is never closed, so a
  // missing vault is an RPC or layout fault that must fail rather than under-report.
  const balances = await getTokenAccountBalances(reserves.map(r => r.vault), { chain: api.chain })
  for (const [mint, amount] of Object.entries(balances)) add(mint, amount)
}

async function borrowed(api) {
  const connection = getConnection(api.chain)
  const reserves = await getReserves(connection)
  const add = await getAdder(connection, api)
  for (const { mint, borrowed } of reserves) add(mint, borrowed)
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is the tokens held in the liquidity vault of every Aera reserve on Cookie Chain: COOK supplied by lenders and not lent out, plus bCOOK posted as collateral. bCOOK is valued as the native COOK it redeems for, using the BakeYourStake stake pool exchange rate (totalLamports / poolTokenSupply). Borrowed is the outstanding COOK debt including interest accrued up to the current slot (borrowed_principal x borrow_index, with the index advanced by the reserve interest-rate curve since its last update).',
  cookiechain: { tvl, borrowed },
}
