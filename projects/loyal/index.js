const { PublicKey } = require('@solana/web3.js')
const { getConfig } = require('../helper/cache')
const { getConnection, runInChunks, sumTokens2 } = require('../helper/solana')
const ADDRESSES = require('../helper/coreAssets.json')

const VAULTS_API = 'https://stats.askloyal.com/api/earn/vaults'

const KLEND_PROGRAM_ID = new PublicKey('KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD')
const USDC_MINT = ADDRESSES.solana.USDC

// RiskBasket.Safe — packages/loyal-actions/src/constants.ts
const SAFE_MARKETS = [
  '7u3HeHxYDLhnCoErrtycNokbQYbWGzLs6JSDqGAv5PfF', // Main
  'CqAoLuqWtavaVE8deBjMKe8ZfSt9ghR6Vb8nfsyabyHA', // Figure
  '6WEGfej9B9wjxRs6t4BYpb9iCXd8CpTpJ8fVSNzHCC5y', // Maple
  '47tfyEG9SsdEnUm9cw5kY9BXngQGqu3LBoop9j5uTAv8', // OnRe
  'BJnbcRHqvppTyGesLzWASGKnmnF1wq9jZu6ExrjT7wvF', // Ethena
]

const OBLIGATION_TAG = 0
const OBLIGATION_ID = 0
const RPC_SLEEP_MS = 300

// Obligation layout (matches @loyal-labs/smart-account-vaults)
const DEPOSITS_OFFSET = 96
const COLLATERAL_SIZE = 136
const DEPOSITED_AMOUNT_OFFSET = 32

const RESERVE_LIQUIDITY_MINT = 8 + 120
const RESERVE_COLLATERAL_MINT = 8 + 2584 - 32 // ReserveCollateral.mintPubkey, 32B before mintTotalSupply

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

function readPubkey(buf, offset) {
  return new PublicKey(buf.subarray(offset, offset + 32)).toBase58()
}

function parseObligationDeposits(data) {
  if (!data || data.length < DEPOSITS_OFFSET + 8 * COLLATERAL_SIZE) return []
  const deposits = []
  for (let i = 0; i < 8; i++) {
    const base = DEPOSITS_OFFSET + i * COLLATERAL_SIZE
    const reserveBytes = data.subarray(base, base + 32)
    if (reserveBytes.every((b) => b === 0)) continue
    const depositedAmountRaw = data.readBigUInt64LE(base + DEPOSITED_AMOUNT_OFFSET)
    if (depositedAmountRaw <= 0n) continue
    deposits.push({ reserve: new PublicKey(reserveBytes).toBase58(), depositedAmountRaw })
  }
  return deposits
}

function fetchAccounts(connection, pubkeys) {
  return runInChunks(
    pubkeys,
    (chunk) => connection.getMultipleAccountsInfo(chunk),
    { chunkSize: 99, sleepTime: RPC_SLEEP_MS },
  )
}

async function tvl(api) {
  const connection = getConnection()

  const data = await getConfig('loyal/vaults', VAULTS_API)
  const owners = Array.isArray(data) ? data : data.vaults || []
  if (!owners.length) throw new Error(`[Loyal] empty vault list from ${VAULTS_API}`)
  api.log(`[Loyal] vaults from API: ${owners.length}`)

  // --- Kamino vanilla obligations (Safe markets): sum collateral shares per reserve ---
  const obligationPubkeys = owners.flatMap((o) =>
    SAFE_MARKETS.map((m) => deriveVanillaObligation(o, m)),
  )
  const obligationInfos = await fetchAccounts(connection, obligationPubkeys)

  const collateralByReserve = new Map()
  for (const info of obligationInfos) {
    if (!info?.data) continue
    for (const d of parseObligationDeposits(Buffer.from(info.data))) {
      collateralByReserve.set(
        d.reserve,
        (collateralByReserve.get(d.reserve) || 0n) + d.depositedAmountRaw,
      )
    }
  }
  api.log(`[Loyal] Kamino reserves with deposits: ${collateralByReserve.size}`)

  if (collateralByReserve.size) {
    const reserveKeys = [...collateralByReserve.keys()].map((r) => new PublicKey(r))
    const reserveInfos = await fetchAccounts(connection, reserveKeys)
    reserveInfos.forEach((info, i) => {
      if (!info?.data) return
      const buf = Buffer.from(info.data)
      // USDC-only for now (multi-mint Earn is env-gated).
      if (readPubkey(buf, RESERVE_LIQUIDITY_MINT) !== USDC_MINT) return
      const collateralMint = readPubkey(buf, RESERVE_COLLATERAL_MINT)
      const shares = collateralByReserve.get(reserveKeys[i].toBase58()) || 0n
      api.add(collateralMint, shares.toString())
    })
  }

  // --- Idle USDC sitting on vault ATAs (included in Loyal admin AUM) ---
  await sumTokens2({ api, tokensAndOwners: owners.map((o) => [USDC_MINT, o]) })

  return api.getBalances()
}

module.exports = {
  timetravel: false,
  doublecounted: true, // deployed into already-listed Kamino Lend
  isHeavyProtocol: true,
  methodology:
    'TVL is on-chain USDC in Loyal Earn Squads vaults, including the treasury autonomous vault listed by the public stats API. Counts redeemable USDC from Kamino Lend vanilla obligations across RiskBasket.Safe markets (Main, Figure, Maple, OnRe, Ethena) as the reserve\'s collateral (cToken) balance plus idle USDC in vault ATAs. Vault addresses come from https://stats.askloyal.com/api/earn/vaults. Overlaps Kamino Lend TVL, so this adapter is marked doublecounted. Non-USDC stables omitted until Earn multi-mint is generally enabled.',
  solana: { tvl },
}
