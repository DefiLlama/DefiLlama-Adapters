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
// borrowed_principal 185 (u128), borrow_index 201 (u128, 1e18 fixed point), ...
const LIQUIDITY_MINT_OFFSET = 40
const LIQUIDITY_VAULT_OFFSET = 72
const BORROWED_PRINCIPAL_OFFSET = 185
const BORROW_INDEX_OFFSET = 201
const RESERVE_MIN_LEN = BORROW_INDEX_OFFSET + 16
const FIXED_POINT_SCALE = 10n ** 18n

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

async function getReserves(connection) {
  const accounts = await connection.getProgramAccounts(PROGRAM, {
    filters: [{ memcmp: { offset: 0, bytes: RESERVE_DISCRIMINATOR_B58 } }],
  })
  const reserves = []
  for (const { pubkey, account } of accounts) {
    const data = account.data
    if (data.subarray(0, 8).toString('hex') !== RESERVE_DISCRIMINATOR_HEX) continue
    if (data.length < RESERVE_MIN_LEN) throw new Error(`Unrecognised Aera Reserve layout: ${pubkey.toBase58()}`)
    const principal = readU128(data, BORROWED_PRINCIPAL_OFFSET)
    const index = readU128(data, BORROW_INDEX_OFFSET)
    reserves.push({
      mint: new PublicKey(data.subarray(LIQUIDITY_MINT_OFFSET, LIQUIDITY_MINT_OFFSET + 32)).toBase58(),
      vault: new PublicKey(data.subarray(LIQUIDITY_VAULT_OFFSET, LIQUIDITY_VAULT_OFFSET + 32)).toBase58(),
      // Debt including accrued interest, rounded up as the program does.
      borrowed: (principal * index + FIXED_POINT_SCALE - 1n) / FIXED_POINT_SCALE,
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
  methodology: 'TVL is the tokens held in the liquidity vault of every Aera reserve on Cookie Chain: COOK supplied by lenders and not lent out, plus bCOOK posted as collateral. bCOOK is valued as the native COOK it redeems for, using the BakeYourStake stake pool exchange rate (totalLamports / poolTokenSupply). Borrowed is the outstanding COOK debt including accrued interest (borrowed_principal x borrow_index).',
  cookiechain: { tvl, borrowed },
}
