const { getConnection } = require('../helper/solana')
const { sliceIntoChunks } = require('../helper/utils')
const { PublicKey } = require('@solana/web3.js')
const { bs58 } = require('@project-serum/anchor/dist/cjs/utils/bytes')

// Rise (https://rise.rich) is a Solana launchpad with on-chain lending built in.
// User-launched tokens live on Rise's program; the actual liquidity, debt and
// fees are accounted for by the underlying Mayflower program via CPI.
//
// Layout summary (Anchor-serialized, all multi-byte ints are little-endian):
//
//   MarketMeta (Mayflower, 488 B)
//     0   8  discriminator
//     8  32  mintMain          ← WSOL/USDC/CBBTC/WETH/ZEC for Rise markets
//   104  32  marketGroup       ← memcmp filter target (Rise group pubkey)
//   ...
//
//   MarketLinear (Mayflower, 304 B)
//     0   8  discriminator
//     8  32  marketMeta        ← derives this account's PDA seed
//    40  64  MarketState:
//             40  8  tokenSupply
//             48  8  totalCashLiquidity   ← TVL signal (in mintMain units)
//             56  8  totalDebt            ← Borrowed signal (in mintMain units)
//             64  8  totalCollateral
//             72 16  cumulativeRevenueMarket  (u128)
//             88 16  cumulativeRevenueTenant  (u128)
const MAYFLOWER = 'AVMmmRzwc2kETQNhPiFVnyu62HrgsQXTD6D7SnSfEz7v'

// Mayflower hosts other tenants too; pin to Rise's MarketGroup so we never
// accidentally count a non-Rise market. Verified on-chain: this group's admin
// field equals Rise's program admin (5scY2JG...).
const RISE_MARKET_GROUP = 'HA9pvTe8F2MLhQK1ZgHn7r2rfd2DJgA7NJBxDfKn9P7d'

// Anchor account discriminator for MarketMeta = sha256("account:MarketMeta")[:8].
const MARKET_META_DISC = bs58.encode(Buffer.from([95, 146, 205, 231, 152, 205, 151, 183]))

const MM_MINT_MAIN_OFFSET    = 8
const MM_MARKET_GROUP_OFFSET = 104
const ML_TOTAL_CASH_OFFSET   = 48
const ML_TOTAL_DEBT_OFFSET   = 56

// Mayflower MarketLinear PDA seeds: ["market_linear", market_meta_address, bump].
// Per Mayflower IDL at https://github.com/riserich/rise-docs (idl/mayflower.json).
// Deriving the address locally lets us pull only mintMain (32 B at offset 8)
// from each MarketMeta and skip reading the full 168-byte prefix that holds
// MarketMeta.market — which would otherwise inflate the response size enough
// to trip the public Solana RPC's per-method 429 cooldown.
const ML_PDA_SEED = Buffer.from('market_linear')

// Cache the in-flight promise (not just the resolved result) so concurrent
// calls of tvl + borrowed share a single fetch. Without this, web3.js fires
// every getProgramAccounts twice in parallel and trips the public RPC's 429.
let _inflight = null
let _cachedAt = 0
let _cached = null
const CACHE_TTL_MS = 60_000

async function getRiseMarkets() {
  if (_cached && (Date.now() - _cachedAt) < CACHE_TTL_MS) return _cached
  if (_inflight) return _inflight
  _inflight = (async () => {
    try {
      const result = await fetchRiseMarkets()
      _cached = result
      _cachedAt = Date.now()
      return result
    } finally {
      _inflight = null
    }
  })()
  return _inflight
}

async function fetchRiseMarkets() {
  const connection = getConnection()
  const programId = new PublicKey(MAYFLOWER)

  // 1. One getProgramAccounts call for every Rise MarketMeta. dataSlice trims
  //    the response to just mintMain (32 B at offset 8); the corresponding
  //    MarketLinear address is derived locally as a PDA from the meta address.
  //    Filtering on the Rise marketGroup keeps the result Rise-only and the
  //    response size at one-shot ~230 KB — public Solana RPCs accept this in
  //    a single call but throttle a follow-up gPA, so we make sure to issue
  //    only one gPA before switching to getMultipleAccountsInfo (which uses a
  //    different rate-limit bucket).
  const metas = await connection.getProgramAccounts(programId, {
    encoding: 'base64',
    filters: [
      { memcmp: { offset: 0, bytes: MARKET_META_DISC } },
      { memcmp: { offset: MM_MARKET_GROUP_OFFSET, bytes: RISE_MARKET_GROUP } },
    ],
    dataSlice: { offset: MM_MINT_MAIN_OFFSET, length: 32 },
  })
  if (!metas.length) return []

  const marketToMint = new Map() // marketLinear pubkey (b58) -> mintMain (b58)
  for (const m of metas) {
    const mintMain = new PublicKey(m.account.data).toBase58()
    const [marketLinear] = PublicKey.findProgramAddressSync(
      [ML_PDA_SEED, m.pubkey.toBuffer()],
      programId,
    )
    marketToMint.set(marketLinear.toBase58(), mintMain)
  }

  // 2. Read MarketLinear accounts in batches via getMultipleAccountsInfo —
  //    a cheap method that public RPCs don't throttle the way they throttle
  //    getProgramAccounts.
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
  return result
}

async function tvl(api) {
  const markets = await getRiseMarkets()
  for (const m of markets) {
    if (m.totalCashLiquidity > 0n) api.add(m.mintMain, m.totalCashLiquidity.toString())
  }
}

async function borrowed(api) {
  const markets = await getRiseMarkets()
  for (const m of markets) {
    if (m.totalDebt > 0n) api.add(m.mintMain, m.totalDebt.toString())
  }
}

module.exports = {
  timetravel: false,
  methodology: `TVL: sum of the main quote token (WSOL, USDC, etc.) held in the liquidity vaults of all Rise markets, read from MarketState.totalCashLiquidity in the underlying Mayflower MarketLinear accounts. Borrowed: sum of MarketState.totalDebt across the same markets, representing main-token debt that users have drawn against their token collateral. Rise markets are identified on-chain by selecting Mayflower MarketMeta accounts whose marketGroup field is Rise's group pubkey (HA9pvTe8...).`,
  solana: { tvl, borrowed },
}
