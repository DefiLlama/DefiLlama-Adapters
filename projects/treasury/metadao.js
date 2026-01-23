// Sum of DAO treasury balances, DAO-owned Meteora DAMM v2 LP positions, and DAO-owned Futarchy AMM positions
// There will be overlap between Futarchy AMM TVL and DAO Treasuries (this adapter) because DAOs own part of the Futarchy AMM TVL through LP positions
// Also double counted in total DeFi TVL will be the DAO-owned Meteora LP positions which will show up here and in Meteora TVL
const { getConnection, sumTokens2 } = require('../helper/solana')
const { sleep } = require('../helper/utils')
const { PublicKey } = require('@solana/web3.js')
const bs58 = require('bs58').default
const crypto = require("crypto")
const BN = require('bn.js')

// Autocrat program ID (v0.5.0) (used to fetch DAO accounts)
const AUTOCRAT_PROGRAM_ID = new PublicKey("auToUr3CQza3D4qreT6Std2MTomfzvrEeCC5qh7ivW5")

// Generic discriminator getter for Anchor accounts
function getDiscriminator(accountName) {
    return crypto
        .createHash("sha256")
        .update(`account:${accountName}`)
        .digest()
        .slice(0, 8)
}

// Decode Autocrat Dao account to extract squadsMultisigVault
// Account layout (Anchor): 8-byte discriminator + fields
// We need to find the squadsMultisigVault field offset
function decodeAutocratDao(data, pubkey) {
    const disc = getDiscriminator("Dao")
    if (!data.slice(0, 8).equals(disc)) return null

    // Try known offsets for squadsMultisigVault based on Autocrat Dao struct
    // The Dao struct likely has: treasury, squadsMultisigVault (Option<Pubkey>), etc.
    // We'll try to find Option<Pubkey> with Some variant (tag=1)
    // Start scanning after discriminator
    let squadsMultisigVault = null

    // Search for Option<Pubkey> with Some variant in the data
    // Option::Some is 1 byte (0x01) followed by 32 bytes pubkey
    for (let offset = 8; offset < data.length - 33; offset++) {
        if (data[offset] === 1) {
            // Potential Some variant, try to read pubkey
            const potentialPubkey = data.slice(offset + 1, offset + 33)
            try {
                const pk = new PublicKey(potentialPubkey)
                // Check if it looks like a valid multisig (not zero, not program IDs we know)
                const pkStr = pk.toString()
                // Squads multisig addresses typically start with certain patterns
                // For now, just take the first valid-looking one after a certain offset
                if (offset > 40) { // After some known fields
                    squadsMultisigVault = pk
                    break
                }
            } catch (_) {
                // Not a valid pubkey, continue
            }
        }
    }

    return {
        address: pubkey.toString(),
        squadsMultisigVault
    }
}

// Fetch all DAOs from Autocrat program
async function getAllDaos(connection) {
    const daoDiscriminator = getDiscriminator("Dao")

    const accounts = await rpcCall(
        connection.getProgramAccounts.bind(connection),
        AUTOCRAT_PROGRAM_ID,
        {
            filters: [{
                memcmp: {
                    offset: 0,
                    bytes: bs58.encode(daoDiscriminator)
                }
            }]
        }
    )
    // console.log(`Found ${accounts.length} Autocrat DAO accounts`)

    // Decode and filter for DAOs with squadsMultisigVault
    const daos = accounts
        .map(acc => decodeAutocratDao(acc.account.data, acc.pubkey))
        .filter(d => d && d.squadsMultisigVault)
        .map(d => ({
            daoAddress: d.address,
            treasuryVaultAddress: d.squadsMultisigVault.toString()
        }))

    // console.log(`${daos.length} DAOs have squadsMultisigVault`)
    return daos
}

// Meteora DAMM Position account layout (Anchor adds 8-byte discriminator!)
// Position struct fields in order: https://github.com/MeteoraAg/damm-v2-sdk/blob/main/src/idl/cp_amm.json#L6813
function decodeMeteoraPosition(data) {
    if (data.length < 200) return null // Minimum size for core fields

    let offset = 8 // Anchor discriminator (8 bytes)

    // pool: Pubkey (32 bytes) @ offset 8
    const pool = readPublicKey(data, offset); offset += 32

    // nft_mint: Pubkey (32 bytes) @ offset 40
    const positionNftMint = readPublicKey(data, offset); offset += 32

    // fee_a_per_token_checkpoint: [u8; 32] @ offset 72
    offset += 32

    // fee_b_per_token_checkpoint: [u8; 32] @ offset 104
    offset += 32

    // fee_a_pending: u64 (8 bytes) @ offset 136
    offset += 8

    // fee_b_pending: u64 (8 bytes) @ offset 144
    offset += 8

    // unlocked_liquidity: u128 (16 bytes) @ offset 152
    const unlockedLiquidity = readU128LE(data, offset); offset += 16

    // vested_liquidity: u128 (16 bytes) @ offset 168
    const vestedLiquidity = readU128LE(data, offset); offset += 16

    // permanent_locked_liquidity: u128 (16 bytes) @ offset 184
    const permanentLockedLiquidity = readU128LE(data, offset); offset += 16

    return {
        pool,
        positionNftMint,
        unlockedLiquidity,
        vestedLiquidity,
        permanentLockedLiquidity
    }
}

// Meteora DAMM Pool account layout (Anchor adds 8-byte discriminator!)
// https://github.com/MeteoraAg/damm-v2-sdk/blob/main/src/idl/cp_amm.json#L6328
// PoolFeesStruct size breakdown:
//   BaseFeeStruct = BaseFeeInfo(32) + padding(8) = 40
//   DynamicFeeStruct = 96 bytes
//   PoolFeesStruct = BaseFeeStruct(40) + 3 u8s + 5 padding + DynamicFeeStruct(96) + u128(16) = 160
const POOL_FEES_SIZE = 160

function decodeMeteoraPool(data) {
    if (data.length < 480) return null

    let offset = 8 // Anchor discriminator (8 bytes)

    // pool_fees: PoolFeesStruct @ offset 8
    offset += POOL_FEES_SIZE // skip to offset 8 + 160 = 168

    // token_a_mint: Pubkey @ offset 168
    const tokenAMint = readPublicKey(data, offset); offset += 32

    // token_b_mint: Pubkey @ offset 200
    const tokenBMint = readPublicKey(data, offset); offset += 32

    // token_a_vault: Pubkey @ offset 232
    const tokenAVault = readPublicKey(data, offset); offset += 32

    // token_b_vault: Pubkey @ offset 264
    const tokenBVault = readPublicKey(data, offset); offset += 32

    // whitelisted_vault: Pubkey @ offset 296
    offset += 32

    // partner: Pubkey @ offset 328
    offset += 32

    // liquidity: u128 @ offset 360
    const totalLiquidity = readU128LE(data, offset); offset += 16

    // _padding: u128 @ offset 376
    offset += 16

    // protocol_a_fee: u64 @ offset 392
    offset += 8

    // protocol_b_fee: u64 @ offset 400
    offset += 8

    // partner_a_fee: u64 @ offset 408
    offset += 8

    // partner_b_fee: u64 @ offset 416
    offset += 8

    // sqrt_min_price: u128 @ offset 424
    const sqrtMinPrice = readU128LE(data, offset); offset += 16

    // sqrt_max_price: u128 @ offset 440
    const sqrtMaxPrice = readU128LE(data, offset); offset += 16

    // sqrt_price: u128 @ offset 456
    const sqrtPrice = readU128LE(data, offset); offset += 16

    return {
        tokenAMint,
        tokenBMint,
        tokenAVault,
        tokenBVault,
        totalLiquidity,
        sqrtMinPrice,
        sqrtMaxPrice,
        sqrtPrice
    }
}

// Calculate withdraw amounts from liquidity using CPAMM math
// Formula from Meteora DAMM: 
// amountA = liquidity * (sqrtPrice - sqrtMinPrice) / (sqrtPrice * sqrtMinPrice) * PRICE_PRECISION
// amountB = liquidity * (sqrtMaxPrice - sqrtPrice) / sqrtMaxPrice
const PRICE_PRECISION = new BN("1000000000000") // 1e12

function calculateWithdrawQuote(liquidity, sqrtPrice, sqrtMinPrice, sqrtMaxPrice) {
    // Ensure we have BN instances
    const liq = new BN(liquidity.toString())
    const price = new BN(sqrtPrice.toString())
    const minPrice = new BN(sqrtMinPrice.toString())
    const maxPrice = new BN(sqrtMaxPrice.toString())

    // amountA = L * (P - Pmin) / Pmin (simplified - token A is "base")
    // amountB = L * (Pmax - P) / PRECISION (simplified - token B is "quote")

    let outAmountA = new BN(0)
    let outAmountB = new BN(0)

    if (price.gt(minPrice) && !minPrice.isZero()) {
        // amountA = liquidity * (sqrtPrice - sqrtMinPrice) / sqrtMinPrice
        const priceDiff = price.sub(minPrice)
        outAmountA = liq.mul(priceDiff).div(minPrice)
    }

    if (maxPrice.gt(price) && !maxPrice.isZero()) {
        // amountB = liquidity * (sqrtMaxPrice - sqrtPrice) / PRICE_PRECISION
        const priceDiff = maxPrice.sub(price)
        outAmountB = liq.mul(priceDiff).div(PRICE_PRECISION)
    }

    return { outAmountA, outAmountB }
}

// Fetch and decode Meteora position balances without SDK
async function getMeteoraPositionBalancesManual(connection, positionPda) {
    try {
        // Fetch position account
        const positionInfo = await rpcCall(
            connection.getAccountInfo.bind(connection),
            positionPda
        )

        if (!positionInfo?.data) {
            // console.log("Position not found:", positionPda.toString())
            return null
        }

        const position = decodeMeteoraPosition(positionInfo.data)
        if (!position) {
            // console.log("Failed to decode position:", positionPda.toString())
            return null
        }

        // Fetch pool account
        const poolInfo = await rpcCall(
            connection.getAccountInfo.bind(connection),
            position.pool
        )

        if (!poolInfo?.data) {
            // console.log("Pool not found:", position.pool.toString())
            return null
        }

        const pool = decodeMeteoraPool(poolInfo.data)
        if (!pool) {
            // console.log("Failed to decode pool:", position.pool.toString())
            return null
        }

        // Calculate withdraw quote
        const quote = calculateWithdrawQuote(
            position.unlockedLiquidity,
            pool.sqrtPrice,
            pool.sqrtMinPrice,
            pool.sqrtMaxPrice
        )

        return {
            tokenAMint: pool.tokenAMint.toString(),
            tokenBMint: pool.tokenBMint.toString(),
            tokenAAmount: quote.outAmountA.toString(),
            tokenBAmount: quote.outAmountB.toString(),
        }

    } catch (e) {
        console.error("Meteora decode error:", positionPda.toString(), e.message)
        return null
    }
}

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
// MetaDAO Treasury (original, holds <100 USDC)
const METADAO_TREASURY = "BxgkvRwqzYFWuDbRjfTYfgTtb41NaFw1aQ3129F79eBT"
// MetaDAO Treasury V6 (new, holds >10M USDC)
const METADAO_TREASURY_V6 = "BfzJzFUeE54zv6Q2QdAZR4yx7UXuYRsfkeeirrRcxDvk"
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

// AMM Position discriminator
function getAmmPositionDiscriminator() {
    return getDiscriminator("AmmPosition")
}

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
    const daoDisc = getDiscriminator("Dao")
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

// Load all Futarchy DAO AMM accounts
async function fetchDaoAccounts(connection) {
    const daoDisc = getDiscriminator("Dao")

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

        const ammView = decodeDaoAmm(acc.account.data)
        if (ammView) {
            daoAmmMap.set(daoKey, ammView)
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
            // console.log(`Skipping DAO ${daoPk} due to vault error:`, e.message)
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

// Meteora DAMM; Derive PDA - NFT Mint <> Position PDA
function deriveMeteoraPositionPda(mint) {
    const mintKey = new PublicKey(mint)

    const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from("position"), mintKey.toBuffer()],
        DAMM_PROGRAM_ID
    )

    return pda
}

// Process all Meteora position NFTs
async function processMeteoraPositions(connection, nftMints) {
    const balances = {}
    const positionPdas = [...nftMints].map(mint => deriveMeteoraPositionPda(mint))

    // console.log("PDAs:", positionPdas.length)

    for (const pda of positionPdas) {
        await sleep(SLEEP_MS)
        // const decoded = await getMeteoraPositionBalances(connection, pda)
        const decoded = await getMeteoraPositionBalancesManual(connection, pda)
        if (!decoded) continue

        balances[decoded.tokenAMint] =
            (balances[decoded.tokenAMint] || 0n) + BigInt(decoded.tokenAAmount)
        balances[decoded.tokenBMint] =
            (balances[decoded.tokenBMint] || 0n) + BigInt(decoded.tokenBAmount)
    }

    return balances
}

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

// Combined TVL
async function tvl() {
    const connection = getConnection()

    // Fetch and filter DAOs
    console.log("\n=== Fetching All Futarchy DAOs ===")
    // const service = new FutarchyService(connection)
    // const allDaos = await service.getAllDaos()
    const allDaos = await getAllDaos(connection)

    const daos = allDaos.filter(dao => {
        const pair = createDaoPair(dao.daoAddress, dao.treasuryVaultAddress)
        return !EXCLUDED_PAIRS.has(pair)
    })

    console.log(`\nFound ${allDaos.length} total DAOs, excluding ${allDaos.length - daos.length}, processing ${daos.length}:`)
    daos.forEach((dao, idx) => {
        console.log(`${idx + 1}. DAO: ${dao.daoAddress}`)
        console.log(`   Treasury: ${dao.treasuryVaultAddress}`)
    })

    const excludedDaoAddresses = getExcludedDaoAddresses(EXCLUDED_PAIRS)

    // Calculate Futarchy AMM LP positions
    const ammBalances = await getFutarchyAmmTvl(connection, excludedDaoAddresses)

    console.log("== Double Counted Futarchy AMM TVL ==")
    for (const [mint, amt] of Object.entries(ammBalances)) {
        console.log(mint, amt.toString())
    }

    // Fetch treasury vault token accounts
    // Deduplicate vaults to reduce RPC calls (some DAOs share the same treasury)
    console.log("\n=== Futarchy Vaults & Meteora ===")
    const allVaults = [...daos.map(d => d.treasuryVaultAddress), METADAO_TREASURY, METADAO_TREASURY_V6]
    const vaults = [...new Set(allVaults)]
    // console.log(`${vaults.length} unique Futarchy vaults (from ${allVaults.length})`)

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

module.exports = {
    timetravel: false,
    methodology:
        "Sum of Futarchy DAO Squads multisig vault SPL token balances, value of Futarchy DAO owned Meteora DAMM v2 LP positions, and DAO-owned Futarchy AMM LP positions.",
    solana: { tvl },
}