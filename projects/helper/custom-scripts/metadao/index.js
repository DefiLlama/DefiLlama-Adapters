// Place under MetaDAO parent project as "Futarchy DAO Treasuries"
// Sum of Futarchy DAO treasury balances, Futarchy DAO-owned Meteora DAMM v2 LP positions, and Futarchy DAO-owned Futarchy AMM positions
// In total MetaDAO project TVL and DeFiLlama total TVL there will be overlap between Futarchy AMM TVL and Futarchy DAO Treasuries (this adapter) because DAOs own part of the Futarchy AMM TVL through LP positions
// Printed is Futarchy DAO-owned LP TVL for visibility so it can be backed out of rolled up TVLs in DeFiLlama
// Also double counted in total DeFi TVL will be the DAO-owned Meteora LP positions; they will show up here and in Meteora TVL - printed for visibility
const { getConnection, sumTokens2, getProvider } = require('../../solana')
const { PublicKey } = require('@solana/web3.js')
const { CpAmm } = require("@meteora-ag/cp-amm-sdk")
const sdk = require('@defillama/sdk')
const crypto = require("crypto")
const BN = require('bn.js')
const { Program, utils: {
  bytes: { bs58 }
} } = require("@project-serum/anchor")

// CONSTANTS ============================================================================
// Define throttle
const SLEEP_MS = 5000

// Base TVL precision
const PRECISION = new BN("1000000000000000000") // 1e18

// Targeted tokens
const TOKEN_PROGRAM_IDS = [
  new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"), // SPL Token
  new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"), // Token-2022
]
// DAMM v2 program - position PDAs derived from
const DAMM_PROGRAM_ID = new PublicKey("cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG")
// Futarchy AMM program
const FUTARCHY_AMM_PROGRAM_ID = new PublicKey("FUTARELBfJfQ8RDGhg1wdhddq1odMAJUePHFuBYfUxKq")
// MetaDAO Treasury
const METADAO_TREASURY = "BxgkvRwqzYFWuDbRjfTYfgTtb41NaFw1aQ3129F79eBT"
// Exclusion list
const EXCLUDED_PAIRS = new Set([
  'CJCgDqiDtkQvwXT2iiyY7QVajKLH3VRVbcsNQgtttrHn/8qFXMdjWtqwSmZAp1ZFcR9xyGBRq4fDQ9ekKHt47Uvcd',
  'DMB74TZgN7Rqfwtqqm3VQBgKBb2WYPdBqVtHbvB4LLeV/7z4xFDoYd7rGb5WiuAiTwrb67AdSWSLQz3pUDYtkiBwS',
  '651uV1hcd7SprwwkumFfkWtx5WrnD53awpjduGtGsHzS/Dp4vBGNvFamZyXnPXyzBXzn3ksjjvtqkt8D7aq4itH6C',
  'Eo1BLMVRLJspjP5dDnwzK1m6FxMUcQDG6kDA8CjWPzRW/HYxxFY3BgPe3CG6gpuisct572stCJ93gxaJ1ZzXxsWSo',
  'EbcsPbXZa81xUunDSmzYrcAWGURxcZB6BTkgzqvNJBZH/85pCdkCcWSjyrmtqnZywERaZQhq5NTQo7Hssm8W7gLC1',
  'E3BjsvLSFqUqVtDP76qMw4QbETkxvqvg8RTSbRZxWCK4/8HWKpnhyZe7GH1FRu2MiEfvJEEAuLoLbUzFhQA5g38ff',
  '4rW6iVKUq1RWYQ1VBTrjvP9FL4G3Sn7mBj7Yg12kuckv/EEak3tBHawF92EbiCLFqzAeWkRvhoq5aDzsZNLpMBtsD',
  'BQjNtXjZB7b9WrqgJZQWfR52T1MqZoqMELAoombywDi8/Dema3hip2KHCwcimPhqrU7kBgmFho7nRBXYPTFkV3iRA',
  'CLoqV77NtkbrsvtCRDP1vdYxgPZua3nnh7gCNPLzDQQ8/41vxoAGF7XU3JhxJBNihtiWn4xPX2mXPXZjpHSfbP8Ct',
  'CTYxPujxrXiiqwG3gSBVNKuBk8u7mPG9qVMUc4aT1L8u/DjChEAtiLNnx4L8hBpdt3aDs88ufQ1KBo35K5YP2DM6V',
  'j6Hx7bdAzcj1NsoRBqdafFuRkgEU48QeZ1i5NVXz9fF/97U5nZnJewd9pkGr9T14vQFMx4XomtA6gEgRE9qjDKPa',
  'CnUUCGbSrAoaJniPifRU8zHRZ6e5uGRVSpCEj2WMeeSv/91DnCr9T1v1QvcuYxmXh7uB2e3wcgsFKLyKqiWvoDgHH',
  'BgNq2V6vea2C7Z3cZhDUJTbmN4Y9bKG6dfEPhH19J7Fb/4XAuBSuNc46tG2gpDQEVNaqKmeJv23842QMSg7wT7waF',
])

// UTILITY FUNCTIONS ============================================================================

// Sleep helper
const sleep = ms => new Promise(r => setTimeout(r, ms))

// Retry helper
async function fetchWithRetry(fetchFn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetchFn()
    } catch (e) {
      if (e.message.includes('429') && i < maxRetries - 1) {
        const backoff = Math.pow(2, i) * 1000
        console.log(`Rate limited, waiting ${backoff}ms...`)
        await sleep(backoff)
        continue
      }
      throw e
    }
  }
}

// RPC call wrapper with 429 handling
async function rpcCall(fn, ...args) {
  let delay = 500
  while (true) {
    try {
      await sleep(SLEEP_MS)
      return await fn(...args)
    } catch (e) {
      const msg = e?.message || ""
      if (!msg.includes("429")) throw e
      console.log(`RPC 429, retrying in ${delay}ms...`)
      await sleep(delay)
      delay = Math.min(delay * 2, 4000)
    }
  }
}

// Format DAO + treasury address into a lookup key
function createDaoPair(daoAddress, treasuryAddress) {
  return `${daoAddress}/${treasuryAddress}`
}

// Extract only DAO addresses from excluded pairs
function getExcludedDaoAddresses(excludedPairs) {
  return new Set(
    Array.from(excludedPairs).map(pair => pair.split('/')[0])
  )
}

// Standard solana:<mint> token key
function formatSolanaToken(mint) {
  return `solana:${mint}`
}

// DISCRIMINATOR HELPERS ============================================================================

// Generic discriminator generator
function getDiscriminator(accountName) {
  return crypto
    .createHash("sha256")
    .update(`account:${accountName}`)
    .digest()
    .slice(0, 8)
}

// AMM Position discriminator
function getAmmPositionDiscriminator() {
  return getDiscriminator("AmmPosition")
}

// Futarchy DAO discriminator
function getDaoDiscriminator() {
  return getDiscriminator("Dao")
}

// BORSH DECODING HELPERS ============================================================================

// Read u64 (LE)
function readU64LE(buf, offset) {
  return new BN(buf.slice(offset, offset + 8), "le")
}

// Read u128 (LE)
function readU128LE(buf, offset) {
  return new BN(buf.slice(offset, offset + 16), "le")
}

// Read PublicKey from buffer
function readPublicKey(buf, offset) {
  return new PublicKey(buf.slice(offset, offset + 32))
}

// Skip over TWAP oracle structure
function skipTwapOracle(data, offset) {
  return offset + 100
}

// Skip over Pool struct
function skipPool(data, offset) {
  let o = skipTwapOracle(data, offset)
  o += 8 * 4
  return o
}

// Skip over PoolState enum
function skipPoolState(data, offset) {
  let o = offset
  const tag = data[o]
  o += 1

  if (tag === 0) {
    o = skipPool(data, o)
  } else if (tag === 1) {
    o = skipPool(data, o)
    o = skipPool(data, o)
    o = skipPool(data, o)
  } else {
    throw new Error(`Unknown PoolState tag: ${tag}`)
  }

  return o
}

// ACCOUNT DECODERS ============================================================================

// AMM Position decoder
function decodeAmmPosition(data) {
  const disc = getAmmPositionDiscriminator()
  if (!data.slice(0, 8).equals(disc)) return null

  let offset = 8
  const dao = readPublicKey(data, offset); offset += 32
  const positionAuthority = readPublicKey(data, offset); offset += 32
  const liquidity = readU128LE(data, offset)

  return { dao, positionAuthority, liquidity }
}

// Decode DAO AMM account
function decodeDaoAmm(data) {
  const daoDisc = getDaoDiscriminator()
  if (!data.slice(0, 8).equals(daoDisc)) return null

  let o = 8
  o = skipPoolState(data, o)

  const totalLiquidity = readU128LE(data, o); o += 16
  const baseMint = readPublicKey(data, o); o += 32
  const quoteMint = readPublicKey(data, o); o += 32
  const ammBaseVault = readPublicKey(data, o); o += 32
  const ammQuoteVault = readPublicKey(data, o); o += 32

  return {
    totalLiquidity,
    baseMint,
    quoteMint,
    ammBaseVault,
    ammQuoteVault,
  }
}

// Read SPL token account amount
async function getSplTokenAccountBalance(connection, vaultPk) {
  const info = await rpcCall(
    connection.getAccountInfo.bind(connection),
    vaultPk
  )

  if (!info?.data) return new BN(0)

  // SPL token layout: amount @ offset 64..72 (u64 LE)
  return readU64LE(info.data, 64)
}


async function getAllDaos() {
  const PROGRAM_ID = 'FUTARELBfJfQ8RDGhg1wdhddq1odMAJUePHFuBYfUxKq' // Futarchy AMM program
  const provider = getProvider()
  const idl = await Program.fetchIdl(PROGRAM_ID, provider)
  const program = new Program(idl, PROGRAM_ID, provider)
  const data = await program.account.dao.all()

  return data
    .filter(d => d.account.squadsMultisigVault)
    .map(d => ({
      daoAddress: d.publicKey.toString(),
      treasuryVaultAddress: d.account.squadsMultisigVault.toString(),
    }))
}

// FUTARCHY AMM LP POSITIONS ============================================================================

// Load all Futarchy DAO AMM accounts
async function fetchDaoAccounts(connection) {
  const daoDisc = getDaoDiscriminator()

  return await rpcCall(
    connection.getProgramAccounts.bind(connection),
    FUTARCHY_AMM_PROGRAM_ID,
    {
      filters: [{
        memcmp: {
          offset: 0,
          bytes: bs58.encode(daoDisc),
        },
      }],
    }
  )
}

// Load all AMM Position accounts
async function fetchAmmPositionAccounts(connection) {
  const ammDisc = getAmmPositionDiscriminator()

  return await rpcCall(
    connection.getProgramAccounts.bind(connection),
    FUTARCHY_AMM_PROGRAM_ID,
    {
      filters: [{
        memcmp: {
          offset: 0,
          bytes: bs58.encode(ammDisc),
        },
      }],
    }
  )
}

// Build map of DAO → AMM view
function buildDaoAmmMap(daoAccounts, excludedDaoAddresses) {
  const daoAmmMap = new Map()

  for (const acc of daoAccounts) {
    const daoKey = acc.pubkey.toString()

    if (excludedDaoAddresses.has(daoKey)) continue

    try {
      const ammView = decodeDaoAmm(acc.account.data)
      if (ammView) {
        daoAmmMap.set(daoKey, ammView)
      }
    } catch (e) {
      console.log(`Failed to decode Dao AMM for ${daoKey}:`, e.message)
    }
  }

  return daoAmmMap
}

// Return only LP positions owned by DAOs
function filterDaoOwnedPositions(posAccounts, daoAmmMap) {
  const daoOwnedPositions = []

  for (const acc of posAccounts) {
    const position = decodeAmmPosition(acc.account.data)
    if (position && daoAmmMap.has(position.dao.toString())) {
      daoOwnedPositions.push(position)
    }
  }

  return daoOwnedPositions
}

// Group LP positions per DAO
function groupPositionsByDao(positions) {
  const byDao = {}

  for (const p of positions) {
    const k = p.dao.toString()
    if (!byDao[k]) byDao[k] = []
    byDao[k].push(p)
  }

  return byDao
}

// Percentage share of LP liquidity
function calculatePositionShare(positionLiquidity, totalLiquidity) {
  return positionLiquidity.mul(PRECISION).div(totalLiquidity)
}

// Scale vault balance by LP share
function allocateVaultBalance(vaultBalance, share) {
  return vaultBalance.mul(share).div(PRECISION)
}

// Calculate LP token balances per DAO
async function calculateDaoLpBalances(connection, daoAmmMap, positionsByDao) {
  const balances = {}

  for (const [daoPk, positions] of Object.entries(positionsByDao)) {
    const ammView = daoAmmMap.get(daoPk)
    if (!ammView || ammView.totalLiquidity.isZero()) continue

    const { totalLiquidity, baseMint, quoteMint, ammBaseVault, ammQuoteVault } = ammView

    let baseVaultBal, quoteVaultBal
    try {
      baseVaultBal = await getSplTokenAccountBalance(connection, ammBaseVault)
      quoteVaultBal = await getSplTokenAccountBalance(connection, ammQuoteVault)
    } catch (e) {
      console.log(`Skipping DAO ${daoPk} due to vault error:`, e.message)
      continue
    }

    const baseMintKey = formatSolanaToken(baseMint)
    const quoteMintKey = formatSolanaToken(quoteMint)

    for (const position of positions) {
      const share = calculatePositionShare(position.liquidity, totalLiquidity)
      const allocBase = allocateVaultBalance(baseVaultBal, share)
      const allocQuote = allocateVaultBalance(quoteVaultBal, share)

      balances[baseMintKey] = (balances[baseMintKey] || 0) + Number(allocBase)
      balances[quoteMintKey] = (balances[quoteMintKey] || 0) + Number(allocQuote)
    }
  }

  return balances
}

// High-level Futarchy AMM LP TVL aggregator
async function getFutarchyAmmTvl(connection, excludedDaoAddresses) {
  console.log("\n=== Futarchy AMM LP Positions ===")
  console.log("Fetching all DAO accounts...")

  const daoAccounts = await fetchDaoAccounts(connection)
  console.log("Found DAO accounts:", daoAccounts.length)

  const daoAmmMap = buildDaoAmmMap(daoAccounts, excludedDaoAddresses)
  console.log(`Processing ${daoAmmMap.size} DAOs (excluded ${daoAccounts.length - daoAmmMap.size})`)

  console.log("Fetching all LP positions...")
  const posAccounts = await fetchAmmPositionAccounts(connection)
  console.log("Found AmmPosition accounts:", posAccounts.length)

  const daoOwnedPositions = filterDaoOwnedPositions(posAccounts, daoAmmMap)
  console.log("DAO-owned LP positions:", daoOwnedPositions.length)

  const positionsByDao = groupPositionsByDao(daoOwnedPositions)
  const balances = await calculateDaoLpBalances(connection, daoAmmMap, positionsByDao)

  console.log("Futarchy AMM tokens discovered:", Object.keys(balances).length)
  return balances
}

// METEORA DAMM POSITIONS ============================================================================

// Meteora DAMM; Derive PDA - NFT Mint <> Position PDA
function deriveMeteoraPositionPda(mint) {
  const mintKey = new PublicKey(mint)

  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("position"), mintKey.toBuffer()],
    DAMM_PROGRAM_ID
  )

  return pda
}

// Decode and withdraw liquidity from a Meteora position
async function getMeteoraPositionBalances(connection, positionPda) {
  try {
    const cpAmm = new CpAmm(connection)

    const positionState = await fetchWithRetry(() =>
      cpAmm.fetchPositionState(positionPda)
    )

    const poolAddress = positionState.pool
    const poolState = await fetchWithRetry(() =>
      cpAmm.fetchPoolState(poolAddress)
    )

    const liquidity = new BN(positionState.unlockedLiquidity, 16)
    const sqrtPrice = new BN(poolState.sqrtPrice, 16)
    const sqrtMinPrice = new BN(poolState.sqrtMinPrice, 16)
    const sqrtMaxPrice = new BN(poolState.sqrtMaxPrice, 16)

    const quote = await cpAmm.getWithdrawQuote({
      liquidityDelta: liquidity,
      sqrtPrice,
      minSqrtPrice: sqrtMinPrice,
      maxSqrtPrice: sqrtMaxPrice,
    })

    return {
      tokenAMint: poolState.tokenAMint.toString(),
      tokenBMint: poolState.tokenBMint.toString(),
      tokenAAmount: quote.outAmountA.toString(),
      tokenBAmount: quote.outAmountB.toString(),
    }

  } catch (e) {
    console.error("Decode error:", positionPda.toString(), e.message)
    return null
  }
}

// Process all Meteora position NFTs
async function processMeteoraPositions(connection, nftMints) {
  const balances = {}
  const positionPdas = [...nftMints].map(mint => deriveMeteoraPositionPda(mint))

  console.log("Derived position PDAs:", positionPdas.length)

  for (const pda of positionPdas) {
    await sleep(SLEEP_MS)
    const decoded = await getMeteoraPositionBalances(connection, pda)
    if (!decoded) continue

    balances[decoded.tokenAMint] =
      (balances[decoded.tokenAMint] || 0n) + BigInt(decoded.tokenAAmount)
    balances[decoded.tokenBMint] =
      (balances[decoded.tokenBMint] || 0n) + BigInt(decoded.tokenBAmount)
  }

  return balances
}

// TREASURY TOKEN ACCOUNTS ============================================================================

// Fetch parsed SPL + Token-2022 accounts for vaults
async function fetchVaultTokenAccounts(connection, vaults) {
  const tokenAccountResults = []

  for (const vault of vaults) {
    const accounts = []

    for (const PROGRAM of TOKEN_PROGRAM_IDS) {
      try {
        await sleep(SLEEP_MS)
        const resp = await fetchWithRetry(() =>
          connection.getParsedTokenAccountsByOwner(
            new PublicKey(vault),
            { programId: PROGRAM },
          )
        )
        accounts.push(...resp.value)
      } catch (e) {
        console.log("Vault fetch error:", vault, e.message)
      }
    }

    tokenAccountResults.push(accounts)
  }

  return tokenAccountResults.flat()
}

// Split raw token accounts into token accounts + Meteora NFT mints
function extractTokenAccountsAndNfts(tokenAccounts) {
  const accountAddresses = []
  const nftMints = new Set()

  tokenAccounts.forEach(acc => {
    accountAddresses.push(acc.pubkey.toString())

    const info = acc.account.data.parsed.info
    if (info.tokenAmount.amount === "1") {
      nftMints.add(info.mint)
    }
  })

  return { accountAddresses, nftMints }
}

// MAIN TVL FUNCTION ============================================================================

// Combined TVL
async function tvl() {
  const connection = getConnection()

  // Fetch and filter DAOs
  console.log("\n=== Fetching All Futarchy DAOs ===")
  const allDaos = await getAllDaos()

  const daos = allDaos.filter(dao => {
    const pair = createDaoPair(dao.daoAddress, dao.treasuryVaultAddress)
    return !EXCLUDED_PAIRS.has(pair)
  })

  console.log(`\nFound ${allDaos.length} total DAOs, excluding ${allDaos.length - daos.length}, processing ${daos.length}:`)
  daos.forEach((dao, idx) => {
    console.log(`${idx + 1}. DAO: ${dao.daoAddress}`)
    console.log(`   Treasury: ${dao.treasuryVaultAddress}`)
  })
  console.log("")

  const excludedDaoAddresses = getExcludedDaoAddresses(EXCLUDED_PAIRS)

  // Calculate Futarchy AMM LP positions
  const ammBalances = await getFutarchyAmmTvl(connection, excludedDaoAddresses)

  console.log("== Double Counted Futarchy AMM TVL ==")
  for (const [mint, amt] of Object.entries(ammBalances)) {
    console.log(mint, amt.toString())
  }

  // Fetch treasury vault token accounts
  console.log("\n=== Futarchy Vaults & Meteora ===")
  const vaults = [...daos.map(d => d.treasuryVaultAddress), METADAO_TREASURY]
  console.log("Processing", vaults.length, "Futarchy vaults")

  const tokenAccounts = await fetchVaultTokenAccounts(connection, vaults)
  const { accountAddresses, nftMints } = extractTokenAccountsAndNfts(tokenAccounts)

  console.log("Total Futarchy token accounts:", accountAddresses.length)
  console.log("Discovered Meteora NFT mints:", nftMints.size)

  // Process Meteora positions
  const meteoraBalances = await processMeteoraPositions(connection, nftMints)
  console.log("Meteora tokens discovered:", Object.keys(meteoraBalances).length)

  console.log("\n== Double Counted Meteora LP Positions ==")
  for (const [mint, amt] of Object.entries(meteoraBalances)) {
    console.log(formatSolanaToken(mint), amt.toString())
  }

  // Merge all balances
  const mergedBalances = { ...ammBalances }
  for (const [mint, amount] of Object.entries(meteoraBalances)) {
    const key = formatSolanaToken(mint)
    mergedBalances[key] = (mergedBalances[key] || 0) + Number(amount)
  }

  console.log("\nTotal unique tokens:", Object.keys(mergedBalances).length)

  return sumTokens2({
    chain: 'solana',
    tokenAccounts: accountAddresses,
    balances: mergedBalances,
  })
}

async function main() {

  const balances = await tvl();

  console.log("Futarchy DAO Treasuries TVL:", balances);

  await sdk.elastic.writeLog('custom-scripts', {
    metadata: {
      type: 'tvl',
    },
    chain: 'solana',
    project: 'metadao/futarchy-dao-treasuries',
    balances,
    timestamp: Math.floor(Date.now() / 1000),
  });
}

main().catch((err) => {
  console.error("Error computing Futarchy DAO Treasuries TVL:", err);
  process.exit(1);
}).then(() => process.exit(0));