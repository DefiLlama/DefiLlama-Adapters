const { getProvider } = require('../helper/solana')
const { PublicKey } = require('@solana/web3.js')

// Program IDs come from the Jupiter Lend IDL (target/idl/{dex,liquidity}.json in jup-ag/jupiter-lend).
const DEX_PROGRAM_ID = new PublicKey('jupZ4m2GqUCJ5iueMfzQf8khFfH31d4XAQt3RzCT9Vd')
const LIQ_PROGRAM_ID = new PublicKey('jupeiUmn818Jg1ekPURTpr4mFo29p46vygyykFJ3wZC')

// Account discriminator + field offsets are derived from the IDL borsh field order
// (Anchor: 8-byte discriminator, then fields in declaration order, no padding).
// Verified against a live Dex account (5rozJuhA... SyrupUSDC/USDC).
const DEX_ACCOUNT_SIZE = 329
const DEX_DISCRIMINATOR = Buffer.from([236, 30, 181, 80, 209, 217, 25, 163])
const OFF_TOKEN_0 = 11   // after 8 disc + u16 dex_id + u8 re_entrancy
const OFF_TOKEN_1 = 43
const OFF_IS_SMART_COL = 141

// TokenReserve: 8 disc + mint(32) + vault(32) + borrow_rate(2) + fee_on_interest(2)
//             + last_utilization(2) + last_update_timestamp(8) -> supply_exchange_price at 86
const OFF_SUPPLY_EXCHANGE_PRICE = 86
const EXCHANGE_PRICE_PRECISION = 1e12

// UserSupplyPosition: 8 disc + protocol(32) + mint(32) + with_interest(1) -> amount at 73
const OFF_USP_AMOUNT = 73

async function tvl(api) {
  const connection = getProvider(api.chain).connection

  const dexes = await connection.getProgramAccounts(DEX_PROGRAM_ID, {
    filters: [
      { dataSize: DEX_ACCOUNT_SIZE },
      { memcmp: { offset: 0, bytes: DEX_DISCRIMINATOR.toString('base64'), encoding: 'base64' } },
    ],
  })

  // Fluid convention: only smart_col pools contribute to DEX TVL
  // (smart-debt pools have no supply position; Fluid's getDexCollateralReserves
  // returns 0 for them via the smart_col-enabled early-return).
  const pools = []
  const supplyPositionKeys = []
  const reserveKeys = []
  for (const { pubkey, account } of dexes) {
    const data = account.data
    if (data[OFF_IS_SMART_COL] !== 1) continue
    const token0 = new PublicKey(data.slice(OFF_TOKEN_0, OFF_TOKEN_0 + 32))
    const token1 = new PublicKey(data.slice(OFF_TOKEN_1, OFF_TOKEN_1 + 32))

    const [usp0] = PublicKey.findProgramAddressSync(
      [Buffer.from('user_supply_position'), token0.toBuffer(), pubkey.toBuffer()],
      LIQ_PROGRAM_ID,
    )
    const [usp1] = PublicKey.findProgramAddressSync(
      [Buffer.from('user_supply_position'), token1.toBuffer(), pubkey.toBuffer()],
      LIQ_PROGRAM_ID,
    )
    const [res0] = PublicKey.findProgramAddressSync(
      [Buffer.from('reserve'), token0.toBuffer()],
      LIQ_PROGRAM_ID,
    )
    const [res1] = PublicKey.findProgramAddressSync(
      [Buffer.from('reserve'), token1.toBuffer()],
      LIQ_PROGRAM_ID,
    )

    supplyPositionKeys.push(usp0, usp1)
    reserveKeys.push(res0, res1)
    pools.push({ token0, token1 })
  }
  if (pools.length === 0) return

  const accounts = await connection.getMultipleAccountsInfo(
    supplyPositionKeys.concat(reserveKeys),
  )
  const posAcc = accounts.slice(0, supplyPositionKeys.length)
  const resAcc = accounts.slice(supplyPositionKeys.length)

  // Per pool per token: LP claim in native units = position.amount * supply_exchange_price / 1e12.
  // This mirrors Fluid's _getLiquidityCollateral() -> _getCollateralReserves() and equals
  // token{0,1}RealReserves in Fluid's DexResolver.
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i]
    for (const [j, mint] of [[0, pool.token0], [1, pool.token1]]) {
      const pos = posAcc[i * 2 + j]
      const res = resAcc[i * 2 + j]
      if (!pos || !res) continue
      const amount = Number(pos.data.readBigUInt64LE(OFF_USP_AMOUNT))
      const supplyEx = Number(res.data.readBigUInt64LE(OFF_SUPPLY_EXCHANGE_PRICE))
      const native = (amount * supplyEx) / EXCHANGE_PRICE_PRECISION
      if (native > 0) api.add(mint.toBase58(), native)
    }
  }
}

module.exports = {
  methodology:
    "TVL of Jupiter Lend's AMM. Enumerates every Dex account in the DEX program and keeps only smart-collateral pools (is_smart_collateral_enabled=1). For each pool, both token supply claims on the shared Liquidity Layer are read via the UserSupplyPosition PDA and priced at the reserve's current supply_exchange_price. Smart-debt pools are excluded because their liquidity flows through the parent Jupiter Lend TVL via the shared liquidity layer. Marked doublecounted because this liquidity is already counted in Jupiter Lend's parent TVL.",
  doublecounted: true,
  solana: { tvl },
}
