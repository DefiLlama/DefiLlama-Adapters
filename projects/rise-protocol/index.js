const { getConnection } = require('../helper/solana')
const { sliceIntoChunks, sleep } = require('../helper/utils')
const { PublicKey } = require('@solana/web3.js')
const { bs58 } = require('@project-serum/anchor/dist/cjs/utils/bytes')

// Rise (https://rise.rich) is a Solana launchpad with on-chain lending built in.
// User-launched tokens live on Rise's program; the actual liquidity, debt and fees
// are accounted for by the underlying Mayflower program via CPI.
//
// Layout summary (Anchor-serialized, all multi-byte integers are little-endian):
//
//   MarketGroup (Mayflower)
//     0   8  discriminator
//     8  32  tenant
//    40  32  admin                ← Rise markets are those whose group.admin == RISE_ADMIN
//    ...
//
//   MarketMeta (Mayflower)
//     0   8  discriminator
//     8  32  mintMain             ← WSOL or USDC for Rise
//   104  32  marketGroup          ← link back to MarketGroup
//   136  32  market               ← MarketLinear pubkey to read TVL/Borrowed from
//   ...
//
//   MarketLinear (Mayflower)
//     0   8  discriminator
//     8  32  marketMeta           ← link to MarketMeta
//    40  64  MarketState:
//             40  8  tokenSupply
//             48  8  totalCashLiquidity   ← TVL signal (in mintMain units)
//             56  8  totalDebt            ← Borrowed signal (in mintMain units)
//             64  8  totalCollateral
//             72 16  cumulativeRevenueMarket  (u128)
//             88 16  cumulativeRevenueTenant  (u128)
//   ...
const MAYFLOWER = 'AVMmmRzwc2kETQNhPiFVnyu62HrgsQXTD6D7SnSfEz7v'
const RISE_ADMIN = '5scY2JGWLnBubCMbWrn1gi8FQEP8SPjvQ1hfjW4ktYUb'

// Anchor account discriminators = sha256("account:<Name>")[:8]
const MARKET_GROUP_DISC = bs58.encode(Buffer.from([131, 205, 141, 87, 148, 210,  33,  36]))
const MARKET_META_DISC  = bs58.encode(Buffer.from([ 95, 146, 205, 231, 152, 205, 151, 183]))

const MG_ADMIN_OFFSET        = 40
const MM_MINT_MAIN_OFFSET    = 8
const MM_MARKET_GROUP_OFFSET = 104
const MM_MARKET_OFFSET       = 136
const MM_SLICE_LENGTH        = MM_MARKET_OFFSET + 32 // bytes 0..168
const ML_TOTAL_CASH_OFFSET   = 48
const ML_TOTAL_DEBT_OFFSET   = 56

let _cache = null
let _cacheAt = 0
const CACHE_TTL_MS = 60_000

/**
 * Loads every Rise market on-chain and returns one entry per market with its
 * `mintMain`, `totalCashLiquidity` and `totalDebt`. Result is cached for 60s
 * so `tvl` and `borrowed` share a single fetch when both are invoked back to back.
 *
 * RPC shape:
 *   1 getProgramAccounts to find Rise's MarketGroup accounts (filtered by admin).
 *   2 getProgramAccounts (one per group) to list that group's MarketMeta accounts.
 *   N getMultipleAccountsInfo (chunks of 100) to read MarketLinear states.
 *
 * The MarketLinear addresses come from MarketMeta.market (offset 136), so we
 * never have to do a discriminator-only `getProgramAccounts` scan — every call
 * carries a memcmp filter, which keeps the load on the RPC light enough to pass
 * even on free-tier providers.
 */
async function getRiseMarkets() {
  const now = Date.now()
  if (_cache && (now - _cacheAt) < CACHE_TTL_MS) return _cache

  const connection = getConnection()
  const programId = new PublicKey(MAYFLOWER)

  // 1. Find Rise's MarketGroups by admin pubkey. Tiny response (dataSlice=0).
  const groupAccs = await connection.getProgramAccounts(programId, {
    encoding: 'base64',
    filters: [
      { memcmp: { offset: 0, bytes: MARKET_GROUP_DISC } },
      { memcmp: { offset: MG_ADMIN_OFFSET, bytes: RISE_ADMIN } },
    ],
    dataSlice: { offset: 0, length: 0 },
  })
  const riseGroupKeys = groupAccs.map(g => g.pubkey.toBase58())
  if (!riseGroupKeys.length) return []

  // 2. For each Rise group, pull its MarketMetas with a slim slice that
  //    includes mintMain (offset 8) and the MarketLinear pubkey (offset 136).
  //    A short sleep between calls keeps the burst inside the per-second
  //    budget that public Solana RPCs apply to getProgramAccounts.
  const marketToMint = new Map() // marketLinear pubkey (b58) -> mintMain (b58)
  for (let i = 0; i < riseGroupKeys.length; i++) {
    if (i > 0) await sleep(1500)
    const metas = await connection.getProgramAccounts(programId, {
      encoding: 'base64',
      filters: [
        { memcmp: { offset: 0, bytes: MARKET_META_DISC } },
        { memcmp: { offset: MM_MARKET_GROUP_OFFSET, bytes: riseGroupKeys[i] } },
      ],
      dataSlice: { offset: 0, length: MM_SLICE_LENGTH },
    })
    for (const m of metas) {
      const mintMain = new PublicKey(
        m.account.data.subarray(MM_MINT_MAIN_OFFSET, MM_MINT_MAIN_OFFSET + 32)
      ).toBase58()
      const market = new PublicKey(
        m.account.data.subarray(MM_MARKET_OFFSET, MM_MARKET_OFFSET + 32)
      ).toBase58()
      marketToMint.set(market, mintMain)
    }
  }
  if (!marketToMint.size) return []

  // 3. Read MarketLinear accounts in batches via getMultipleAccountsInfo.
  //    Avoids the heavy "scan all of program X" call that public RPCs throttle.
  const marketKeys = Array.from(marketToMint.keys()).map(k => new PublicKey(k))
  const result = []
  for (const chunk of sliceIntoChunks(marketKeys, 100)) {
    const accounts = await connection.getMultipleAccountsInfo(chunk)
    accounts.forEach((acc, i) => {
      if (!acc || !acc.data || acc.data.length < ML_TOTAL_DEBT_OFFSET + 8) return
      const mintMain = marketToMint.get(chunk[i].toBase58())
      if (!mintMain) return
      result.push({
        mintMain,
        totalCashLiquidity: acc.data.readBigUInt64LE(ML_TOTAL_CASH_OFFSET),
        totalDebt:          acc.data.readBigUInt64LE(ML_TOTAL_DEBT_OFFSET),
      })
    })
  }

  _cache = result
  _cacheAt = now
  return result
}

/**
 * TVL: sum of MarketState.totalCashLiquidity across all Rise markets,
 * grouped by quote-asset mint (WSOL or USDC).
 */
async function tvl(api) {
  const markets = await getRiseMarkets()
  for (const m of markets) {
    if (m.totalCashLiquidity > 0n) api.add(m.mintMain, m.totalCashLiquidity.toString())
  }
}

/**
 * Borrowed: sum of MarketState.totalDebt across all Rise markets,
 * representing main-token debt drawn against token collateral.
 */
async function borrowed(api) {
  const markets = await getRiseMarkets()
  for (const m of markets) {
    if (m.totalDebt > 0n) api.add(m.mintMain, m.totalDebt.toString())
  }
}

module.exports = {
  timetravel: false,
  methodology: `TVL: sum of the main quote token (WSOL or USDC) held in the liquidity vaults of all Rise markets, read from MarketState.totalCashLiquidity in the underlying Mayflower MarketLinear accounts. Borrowed: sum of MarketState.totalDebt across the same markets, representing main-token debt that users have drawn against their token collateral. Rise markets are identified on-chain by selecting Mayflower MarketGroups whose admin pubkey is Rise's program admin (5scY2JG...) and then keeping only the markets attached to those groups.`,
  solana: { tvl, borrowed },
}
