// MetaDAO - Assets Under Futarchy (AUF) Calculator
// Sum of all Futarchy DAO treasury balances + AMM liquidity + Meteora LP positions
const { getConnection, sumTokens2, getProvider } = require('../../solana')
const { PublicKey } = require('@solana/web3.js')
const { CpAmm } = require("@meteora-ag/cp-amm-sdk")
const sdk = require('@defillama/sdk')
const { Program } = require("@project-serum/anchor")

// CONSTANTS ============================================================================
const FUTARCHY_AMM_PROGRAM_ID = 'FUTARELBfJfQ8RDGhg1wdhddq1odMAJUePHFuBYfUxKq'
const DAMM_PROGRAM_ID = new PublicKey("cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG")

// MetaDAO Treasuries (in addition to DAO vaults)
const METADAO_TREASURIES = [
  "BfzJzFUeE54zv6Q2QdAZR4yx7UXuYRsfkeeirrRcxDvk",
  "6awyHMshBGVjJ3ozdSJdyyDE1CTAXUwrpNMaRGMsb4sf",
]

const TOKEN_PROGRAM_IDS = [
  new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
  new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"),
]

// Derive Meteora position PDA from NFT mint
function deriveMeteoraPositionPda(mint) {
  const mintKey = new PublicKey(mint)
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("position"), mintKey.toBuffer()],
    DAMM_PROGRAM_ID
  )
  return pda
}

// Fetch all DAOs from Futarchy program
async function getAllDaos() {
  const provider = getProvider()
  const idl = await Program.fetchIdl(FUTARCHY_AMM_PROGRAM_ID, provider)
  const program = new Program(idl, FUTARCHY_AMM_PROGRAM_ID, provider)
  const data = await program.account.dao.all()

  return data
    .filter(d => d.account.squadsMultisigVault)
    .map(d => ({
      daoAddress: d.publicKey.toString(),
      treasuryVaultAddress: d.account.squadsMultisigVault.toString(),
    }))
}

// Fetch token accounts for a list of owners
async function fetchTokenAccounts(connection, owners) {
  const allAccounts = []
  const nftMints = new Set()

  for (const owner of owners) {
    for (const programId of TOKEN_PROGRAM_IDS) {
      try {
        const resp = await connection.getParsedTokenAccountsByOwner(
          new PublicKey(owner),
          { programId }
        )
        
        for (const acc of resp.value) {
          allAccounts.push(acc.pubkey.toString())
          const info = acc.account.data.parsed.info
          // Detect NFTs (amount = 1, decimals = 0)
          if (info.tokenAmount.amount === "1" && info.tokenAmount.decimals === 0) {
            nftMints.add(info.mint)
          }
        }
      } catch (e) {
        console.log(`Error fetching ${owner}: ${e.message}`)
      }
    }
  }

  return { tokenAccounts: allAccounts, nftMints }
}

// Process Meteora LP positions and get underlying token values
async function processMeteoraPositions(connection, nftMints) {
  const balances = {}
  const cpAmm = new CpAmm(connection)

  for (const mint of nftMints) {
    try {
      const positionPda = deriveMeteoraPositionPda(mint)
      const positionState = await cpAmm.fetchPositionState(positionPda)
      const poolState = await cpAmm.fetchPoolState(positionState.pool)

      const quote = await cpAmm.getWithdrawQuote({
        liquidityDelta: positionState.unlockedLiquidity,
        sqrtPrice: poolState.sqrtPrice,
        minSqrtPrice: poolState.sqrtMinPrice,
        maxSqrtPrice: poolState.sqrtMaxPrice,
      })

      const tokenAMint = poolState.tokenAMint.toString()
      const tokenBMint = poolState.tokenBMint.toString()

      balances[tokenAMint] = (balances[tokenAMint] || 0n) + BigInt(quote.outAmountA.toString())
      balances[tokenBMint] = (balances[tokenBMint] || 0n) + BigInt(quote.outAmountB.toString())
    } catch (e) {
      // Not a Meteora position or error, skip
    }
  }

  return balances
}

// Format token key for DefiLlama
function formatSolanaToken(mint) {
  return `solana:${mint}`
}

// MAIN TVL FUNCTION ============================================================================
async function tvl() {
  const connection = getConnection()

  console.log("\n=== Fetching All Futarchy DAOs ===")
  const daos = await getAllDaos()
  console.log(`Found ${daos.length} DAOs with treasury vaults`)

  // Collect all addresses to query:
  // 1. DAO addresses (hold AMM balances)
  // 2. Treasury vault addresses (hold treasury balances)
  // 3. MetaDAO treasury addresses
  const allOwners = [
    ...daos.map(d => d.daoAddress),
    ...daos.map(d => d.treasuryVaultAddress),
    ...METADAO_TREASURIES,
  ]

  console.log(`\nQuerying ${allOwners.length} addresses:`)
  console.log(`  - ${daos.length} DAO addresses (AMM balances)`)
  console.log(`  - ${daos.length} Treasury vaults`)
  console.log(`  - ${METADAO_TREASURIES.length} MetaDAO treasuries`)

  // Fetch all token accounts
  console.log("\n=== Fetching Token Accounts ===")
  const { tokenAccounts, nftMints } = await fetchTokenAccounts(connection, allOwners)
  console.log(`Total token accounts: ${tokenAccounts.length}`)
  console.log(`Potential Meteora NFTs: ${nftMints.size}`)

  // Process Meteora LP positions
  console.log("\n=== Processing Meteora LP Positions ===")
  const meteoraBalances = await processMeteoraPositions(connection, nftMints)
  const meteoraTokenCount = Object.keys(meteoraBalances).length
  console.log(`Meteora underlying tokens: ${meteoraTokenCount}`)

  // Convert Meteora balances to string format
  const meteoraStringBalances = {}
  for (const [mint, amount] of Object.entries(meteoraBalances)) {
    const key = formatSolanaToken(mint)
    meteoraStringBalances[key] = amount.toString()
  }

  console.log("\n=== Calculating Final TVL ===")
  
  // Sum token accounts + Meteora underlying balances
  return sumTokens2({
    chain: 'solana',
    tokenAccounts,
    balances: meteoraStringBalances,
  })
}

async function main() {
  console.log("=".repeat(60))
  console.log("MetaDAO - Assets Under Futarchy Calculator")
  console.log("=".repeat(60))

  const balances = await tvl()

  console.log("\n=== Final TVL Balances ===")
  for (const [token, amount] of Object.entries(balances)) {
    if (Number(amount) > 0) {
      console.log(`${token}: ${amount}`)
    }
  }

  // Write to elastic cache for adapters to read
  await sdk.elastic.writeLog('custom-scripts', {
    metadata: {
      type: 'tvl',
    },
    chain: 'solana',
    project: 'metadao/futarchy-dao-treasuries',
    balances,
    timestamp: Math.floor(Date.now() / 1000),
  })

  console.log("\n✓ TVL written to elastic cache")
}

main().catch((err) => {
  console.error("Error computing Assets Under Futarchy TVL:", err)
  process.exit(1)
}).then(() => process.exit(0))
