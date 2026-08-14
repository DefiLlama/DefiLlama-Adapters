const { PublicKey } = require('@solana/web3.js')
const { getConfig } = require('../helper/cache')
const { getConnection, runInChunks } = require('../helper/solana')
const ADDRESSES = require('../helper/coreAssets.json')

// Preview while PR is open; switch to https://stats.askloyal.com/api/earn/vaults after merge
const VAULTS_API =
  process.env.VAULTS_API ||
  'https://loyal-dashboard-git-vercel-preview-pr-614-loyal-team.vercel.app/api/earn/vaults'

const KLEND_PROGRAM_ID = new PublicKey('KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD')
const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
)
const USDC_MINT = ADDRESSES.solana.USDC

// RiskBasket.Safe — packages/loyal-actions/src/constants.ts
const SAFE_MARKETS = [
  '7u3HeHxYDLhnCoErrtycNokbQYbWGzLs6JSDqGAv5PfF', // Main
  'CqAoLuqWtavaVE8deBjMKe8ZfSt9ghR6Vb8nfsyabyHA', // Figure
  '6WEGfej9B9wjxRs6t4BYpb9iCXd8CpTpJ8fVSNzHCC5y', // Maple
  '47tfyEG9SsdEnUm9cw5kY9BXngQGqu3LBoop9j5uTAv8', // OnRe
  'BJnbcRHqvppTyGesLzWASGKnmnF1wq9jZu6ExrjT7wvF', // Ethena
]

// Not in /api/earn/vaults (that query is user_yield_positions only).
// Loyal treasury autonomous vault — same vanilla klend path as Earn.
// Source: apps/admin/.../autonomous-vault-data.ts MANIFEST.vault
const EXTRA_VAULTS = [
  'F7zuL14omw4JJfS1cvsWXVb3wh48dvsonMJgoc9tYu3e',
]

const OBLIGATION_TAG = 0
const OBLIGATION_ID = 0
const RPC_SLEEP_MS = Number(process.env.LOYAL_RPC_SLEEP_MS || 600)

// Obligation layout (matches @loyal-labs/smart-account-vaults)
const DEPOSITS_OFFSET = 96
const COLLATERAL_SIZE = 136
const DEPOSITED_AMOUNT_OFFSET = 32

// Reserve layout offsets
const RESERVE = {
  liquidityMint: 8 + 120,
  liquidityAvailableAmount: 8 + 216,
  liquidityBorrowedAmountSf: 8 + 224,
  liquidityAccumulatedProtocolFeesSf: 8 + 336,
  liquidityAccumulatedReferrerFeesSf: 8 + 352,
  liquidityPendingReferrerFeesSf: 8 + 368,
  collateralMintTotalSupply: 8 + 2584,
}
const FRACTION_BITS = 60n
const FRACTION_SCALE = 1n << FRACTION_BITS

function deriveVanillaObligation(owner, market) {
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from([OBLIGATION_TAG]),
      Buffer.from([OBLIGATION_ID]),
      new PublicKey(owner).toBuffer(),
      new PublicKey(market).toBuffer(),
      PublicKey.default.toBuffer(),
      PublicKey.default.toBuffer(),
    ],
    KLEND_PROGRAM_ID,
  )
  return pda
}

function getAssociatedTokenAddress(mint, owner) {
  const mintKey = typeof mint === 'string' ? new PublicKey(mint) : mint
  const ownerKey = typeof owner === 'string' ? new PublicKey(owner) : owner
  const [ata] = PublicKey.findProgramAddressSync(
    [ownerKey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mintKey.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID,
  )
  return ata
}

function readU64LE(buf, offset) {
  return buf.readBigUInt64LE(offset)
}

function readU128LE(buf, offset) {
  const lo = buf.readBigUInt64LE(offset)
  const hi = buf.readBigUInt64LE(offset + 8)
  return lo + (hi << 64n)
}

function readPubkey(buf, offset) {
  return new PublicKey(buf.subarray(offset, offset + 32))
}

function parseObligationDeposits(data) {
  if (!data || data.length < DEPOSITS_OFFSET + 8 * COLLATERAL_SIZE) return []
  const deposits = []
  for (let i = 0; i < 8; i++) {
    const base = DEPOSITS_OFFSET + i * COLLATERAL_SIZE
    const reserveBytes = data.subarray(base, base + 32)
    if (reserveBytes.every((b) => b === 0)) continue
    const depositedAmountRaw = readU64LE(data, base + DEPOSITED_AMOUNT_OFFSET)
    if (depositedAmountRaw <= 0n) continue
    deposits.push({
      reserve: new PublicKey(reserveBytes).toBase58(),
      depositedAmountRaw,
    })
  }
  return deposits
}

function parseReserveSnapshot(data) {
  if (!data || data.length < RESERVE.collateralMintTotalSupply + 8) return null
  const liquidityAvailableAmount = readU64LE(data, RESERVE.liquidityAvailableAmount)
  const liquidityBorrowedAmountSf = readU128LE(data, RESERVE.liquidityBorrowedAmountSf)
  const feesSf =
    readU128LE(data, RESERVE.liquidityAccumulatedProtocolFeesSf) +
    readU128LE(data, RESERVE.liquidityAccumulatedReferrerFeesSf) +
    readU128LE(data, RESERVE.liquidityPendingReferrerFeesSf)
  const collateralSupplyRaw = readU64LE(data, RESERVE.collateralMintTotalSupply)
  const grossLiquiditySupplyScaled =
    (liquidityAvailableAmount << FRACTION_BITS) + liquidityBorrowedAmountSf
  const totalLiquiditySupplyScaled =
    grossLiquiditySupplyScaled > feesSf ? grossLiquiditySupplyScaled - feesSf : 0n

  return {
    liquidityMint: readPubkey(data, RESERVE.liquidityMint).toBase58(),
    collateralSupplyRaw,
    totalLiquiditySupplyScaled,
  }
}

function collateralToRedeemableLiquidity(collateralAmountRaw, snapshot) {
  if (collateralAmountRaw <= 0n) return 0n
  if (
    snapshot.collateralSupplyRaw === 0n ||
    snapshot.totalLiquiditySupplyScaled === 0n
  ) {
    return collateralAmountRaw
  }
  return (
    (collateralAmountRaw * snapshot.totalLiquiditySupplyScaled) /
    (snapshot.collateralSupplyRaw * FRACTION_SCALE)
  )
}

function tokenAccountAmount(data) {
  if (!data || data.length < 72) return 0n
  return Buffer.from(data).readBigUInt64LE(64)
}

async function tvl(api) {
  const connection = getConnection()

  const data = await getConfig('loyal/vaults', undefined, {
    fetcher: async () => {
      const res = await fetch(VAULTS_API, {
        headers: process.env.VERCEL_PREVIEW_COOKIE
          ? { Cookie: process.env.VERCEL_PREVIEW_COOKIE }
          : {},
      })
      if (!res.ok) throw new Error(`Loyal vaults API HTTP ${res.status}`)
      return res.json()
    },
  })

  const apiOwners = Array.isArray(data) ? data : data.vaults || []
  const extra = EXTRA_VAULTS.filter((v) => !apiOwners.includes(v))
  const owners = apiOwners.concat(extra)
  console.log(
    `[Loyal] vaults from API: ${apiOwners.length} (count field: ${data.count ?? 'n/a'}; updatedAt: ${data.updatedAt ?? 'n/a'}) + extra ${extra.length}`,
  )

  if (!owners.length) {
    console.log('[Loyal] empty vault list — check VERCEL_PREVIEW_COOKIE / VAULTS_API')
    return {}
  }

  // --- Kamino vanilla obligations (Safe markets) ---
  const obligationPubkeys = []
  for (const owner of owners) {
    for (const market of SAFE_MARKETS) {
      obligationPubkeys.push(deriveVanillaObligation(owner, market))
    }
  }
  console.log(
    `[Loyal] obligation PDAs: ${obligationPubkeys.length} (${owners.length} × ${SAFE_MARKETS.length})`,
  )

  const accountInfos = await runInChunks(
    obligationPubkeys,
    (chunk) => connection.getMultipleAccountsInfo(chunk),
    { chunkSize: 99, sleepTime: RPC_SLEEP_MS },
  )

  const collateralByReserve = new Map()
  let accountsWithData = 0
  let depositSlots = 0

  for (const info of accountInfos) {
    if (!info?.data) continue
    accountsWithData++
    for (const d of parseObligationDeposits(Buffer.from(info.data))) {
      depositSlots++
      collateralByReserve.set(
        d.reserve,
        (collateralByReserve.get(d.reserve) || 0n) + d.depositedAmountRaw,
      )
    }
  }

  console.log(`[Loyal] accounts with data: ${accountsWithData}`)
  console.log(`[Loyal] active collateral slots: ${depositSlots}`)
  console.log(`[Loyal] unique reserves: ${collateralByReserve.size}`)

  let usdcFromObligations = 0n
  let skippedNonUsdcReserves = 0

  if (collateralByReserve.size) {
    const reserveKeys = [...collateralByReserve.keys()].map((r) => new PublicKey(r))
    const reserveInfos = await runInChunks(
      reserveKeys,
      (chunk) => connection.getMultipleAccountsInfo(chunk),
      { chunkSize: 99, sleepTime: RPC_SLEEP_MS },
    )

    for (let i = 0; i < reserveKeys.length; i++) {
      const reserveId = reserveKeys[i].toBase58()
      const info = reserveInfos[i]
      if (!info?.data) continue
      const snapshot = parseReserveSnapshot(Buffer.from(info.data))
      if (!snapshot) continue

      // Product default is USDC-only (NEXT_PUBLIC_EARN_ENABLED_STABLECOINS defaults to USDC).
      // Multi-mint rollout is env-gated; ignore non-USDC dust / test deposits for now.
      if (snapshot.liquidityMint !== USDC_MINT) {
        skippedNonUsdcReserves++
        continue
      }

      const coll = collateralByReserve.get(reserveId) || 0n
      usdcFromObligations += collateralToRedeemableLiquidity(coll, snapshot)
    }
  }

  // --- Idle USDC sitting on vault ATAs (included in Loyal admin AUM) ---
  const usdcAtas = owners.map((o) => getAssociatedTokenAddress(USDC_MINT, o))
  const ataInfos = await runInChunks(
    usdcAtas,
    (chunk) => connection.getMultipleAccountsInfo(chunk),
    { chunkSize: 99, sleepTime: RPC_SLEEP_MS },
  )
  let usdcIdle = 0n
  let idleAccounts = 0
  for (const info of ataInfos) {
    const amt = tokenAccountAmount(info?.data)
    if (amt > 0n) {
      usdcIdle += amt
      idleAccounts++
    }
  }

  const totalUsdc = usdcFromObligations + usdcIdle
  api.add(USDC_MINT, totalUsdc.toString())

  console.log(
    `[Loyal] USDC from obligations: $${(Number(usdcFromObligations) / 1e6).toFixed(2)}`,
  )
  console.log(
    `[Loyal] idle USDC on vaults: $${(Number(usdcIdle) / 1e6).toFixed(2)} (${idleAccounts} ATAs)`,
  )
  console.log(`[Loyal] total USDC TVL: $${(Number(totalUsdc) / 1e6).toFixed(2)}`)
  if (skippedNonUsdcReserves) {
    console.log(
      `[Loyal] skipped ${skippedNonUsdcReserves} non-USDC reserve(s) (multi-mint not counted yet)`,
    )
  }

  return api.getBalances()
}

module.exports = {
  timetravel: false,
  methodology:
    'TVL is on-chain USDC in Loyal Earn Squads vaults plus the Loyal treasury autonomous vault: redeemable USDC from Kamino Lend vanilla obligations across RiskBasket.Safe markets (Main, Figure, Maple, OnRe, Ethena), converting collateral shares with each reserve exchange rate (same method as Loyal earn holdings), plus idle USDC in vault ATAs. User vaults come from /api/earn/vaults; the treasury vault is not in that user-position list and is included explicitly. Non-USDC stables omitted until Earn multi-mint is generally enabled.',
  solana: { tvl },
}
