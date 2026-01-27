// Sum of DAO treasury balances, DAO-owned Meteora DAMM v2 LP positions, and DAO-owned Futarchy AMM positions
// There will be overlap between Futarchy AMM TVL and DAO Treasuries (this adapter) because DAOs own part of the Futarchy AMM TVL through LP positions
// Also double counted in total DeFi TVL will be the DAO-owned Meteora LP positions which will show up here and in Meteora TVL
const { getConnection, sumTokens2, runInChunks, TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } = require('../helper/solana')
const { sleep } = require('../helper/utils')
const { PublicKey } = require('@solana/web3.js')
const bs58 = require('bs58').default
const crypto = require("crypto")
const BN = require('bn.js')


// Autocrat program ID (v0.5.0) (used to fetch DAO accounts)
// https://github.com/metaDAOproject/programs/tree/develop?tab=readme-ov-file#deployments
const AUTOCRAT_PROGRAM_ID = new PublicKey("auToUr3CQza3D4qreT6Std2MTomfzvrEeCC5qh7ivW5")

const PRICE_PRECISION = new BN("1000000000000") // 1e12
const SLEEP_MS = 5000
const TOKEN_PROGRAM_IDS = [TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID]
// Base TVL precision
const PRECISION = new BN("1000000000000000000") // 1e18
// DAMM v2 program - position PDAs derived from
const DAMM_PROGRAM_ID = new PublicKey("cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG")
// Futarchy AMM program (v0.6.0)
const FUTARCHY_AMM_PROGRAM_ID = new PublicKey("FUTARELBfJfQ8RDGhg1wdhddq1odMAJUePHFuBYfUxKq")
// MetaDAO Treasury 
const METADAO_TREASURY = "BxgkvRwqzYFWuDbRjfTYfgTtb41NaFw1aQ3129F79eBT"
// MetaDAO Treasury V6 
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

// Generic discriminator getter for Anchor accounts
function getDiscriminator(accountName) {
    return crypto
        .createHash("sha256")
        .update(`account:${accountName}`)
        .digest()
        .slice(0, 8)
}

// Decode Autocrat Dao account to extract squadsMultisigVault
// Layout: 8 (disc) + 8 (nonce) + 32 (daoCreator) + 1 (pdaBump) + 32 (squadsMultisig) + 32 (squadsMultisigVault)
// https://github.com/metaDAOproject/programs/blob/develop/sdk/src/v0.5/types/autocrat.ts
const SQUADS_MULTISIG_VAULT_OFFSET = 81

function decodeAutocratDao(data, pubkey) {
    const disc = getDiscriminator("Dao")
    if (!data.slice(0, 8).equals(disc)) return null
    if (data.length < SQUADS_MULTISIG_VAULT_OFFSET + 32) return null

    const squadsMultisigVault = new PublicKey(data.slice(SQUADS_MULTISIG_VAULT_OFFSET, SQUADS_MULTISIG_VAULT_OFFSET + 32))
    return { address: pubkey.toString(), squadsMultisigVault }
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

    // Decode and filter for DAOs with squadsMultisigVault
    const daos = accounts
        .map(acc => decodeAutocratDao(acc.account.data, acc.pubkey))
        .filter(d => d && d.squadsMultisigVault)
        .map(d => ({
            daoAddress: d.address,
            treasuryVaultAddress: d.squadsMultisigVault.toString()
        }))

    return daos
}

// Meteora DAMM Position layout: https://github.com/MeteoraAg/damm-v2-sdk/blob/main/src/idl/cp_amm.json#L6813
function decodeMeteoraPosition(data) {
    if (data.length < 200) return null

    let offset = 8 // Skip Anchor discriminator
    const pool = readPublicKey(data, offset); offset += 32
    const positionNftMint = readPublicKey(data, offset); offset += 32
    offset += 32 + 32 + 8 + 8 // Skip fee checkpoints and pending fees
    const unlockedLiquidity = readU128LE(data, offset); offset += 16
    const vestedLiquidity = readU128LE(data, offset); offset += 16
    const permanentLockedLiquidity = readU128LE(data, offset)

    return { pool, positionNftMint, unlockedLiquidity, vestedLiquidity, permanentLockedLiquidity }
}

// Meteora DAMM Pool layout: https://github.com/MeteoraAg/damm-v2-sdk/blob/main/src/idl/cp_amm.json#L6328
function decodeMeteoraPool(data) {
    if (data.length < 480) return null

    let offset = 8 + 160 // Skip discriminator + PoolFeesStruct (160 bytes)
    const tokenAMint = readPublicKey(data, offset); offset += 32
    const tokenBMint = readPublicKey(data, offset); offset += 32
    const tokenAVault = readPublicKey(data, offset); offset += 32
    const tokenBVault = readPublicKey(data, offset); offset += 32
    offset += 32 + 32 // Skip whitelisted_vault + partner
    const totalLiquidity = readU128LE(data, offset); offset += 16
    offset += 16 + 8 + 8 + 8 + 8 // Skip padding + fees
    const sqrtMinPrice = readU128LE(data, offset); offset += 16
    const sqrtMaxPrice = readU128LE(data, offset); offset += 16
    const sqrtPrice = readU128LE(data, offset)

    return { tokenAMint, tokenBMint, tokenAVault, tokenBVault, totalLiquidity, sqrtMinPrice, sqrtMaxPrice, sqrtPrice }
}

// Calculate withdraw amounts from liquidity using CPAMM math
function calculateWithdrawQuote(liquidity, sqrtPrice, sqrtMinPrice, sqrtMaxPrice) {
    const liq = new BN(liquidity.toString())
    const price = new BN(sqrtPrice.toString())
    const minPrice = new BN(sqrtMinPrice.toString())
    const maxPrice = new BN(sqrtMaxPrice.toString())

    let outAmountA = new BN(0)
    let outAmountB = new BN(0)

    if (price.gt(minPrice) && !minPrice.isZero()) {
        outAmountA = liq.mul(price.sub(minPrice)).div(minPrice)
    }
    if (maxPrice.gt(price) && !maxPrice.isZero()) {
        outAmountB = liq.mul(maxPrice.sub(price)).div(PRICE_PRECISION)
    }

    return { outAmountA, outAmountB }
}

// Fetch and decode Meteora position balances without SDK
async function getMeteoraPositionBalancesManual(connection, positionPda) {
    // Fetch position account
    const positionInfo = await rpcCall(
        connection.getAccountInfo.bind(connection),
        positionPda
    )

    if (!positionInfo?.data) return null

    const position = decodeMeteoraPosition(positionInfo.data)
    if (!position) return null

    // Fetch pool account
    const poolInfo = await rpcCall(
        connection.getAccountInfo.bind(connection),
        position.pool
    )

    if (!poolInfo?.data) return null

    const pool = decodeMeteoraPool(poolInfo.data)
    if (!pool) return null

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
            await sleep(delay)
            delay = Math.min(delay * 2, 4000)
        }
    }
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

// Pool struct size: TWAP oracle (100) + 4 u64s (32) = 132 bytes
const POOL_SIZE = 132

// Futarchy AmmPosition layout: https://github.com/metaDAOproject/programs/blob/develop/sdk/src/v0.6/types/futarchy.ts#L1176
function decodeAmmPosition(data) {
    const disc = getDiscriminator("AmmPosition")
    if (!data.slice(0, 8).equals(disc)) return null

    let offset = 8
    const dao = readPublicKey(data, offset); offset += 32
    const positionAuthority = readPublicKey(data, offset); offset += 32
    const liquidity = readU128LE(data, offset)

    return { dao, positionAuthority, liquidity }
}

// Futarchy Dao layout: https://github.com/metaDAOproject/programs/blob/develop/sdk/src/v0.6/types/futarchy.ts#L1196
function decodeDaoAmm(data) {
    const daoDisc = getDiscriminator("Dao")
    if (!data.slice(0, 8).equals(daoDisc)) return null

    // Skip PoolState enum: 1 byte tag + 1 or 3 Pool structs
    let o = 8
    const tag = data[o++]
    if (tag === 0) o += POOL_SIZE
    else if (tag === 1) o += POOL_SIZE * 3
    else throw new Error(`Unknown PoolState tag: ${tag}`)

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

// Calculate LP token balances per DAO
async function calculateDaoLpBalances(connection, daoAmmMap, positionsByDao) {
    const balances = {}

    for (const [daoPk, positions] of Object.entries(positionsByDao)) {
        const ammView = daoAmmMap.get(daoPk)
        if (!ammView || ammView.totalLiquidity.isZero()) continue

        const { totalLiquidity, baseMint, quoteMint, ammBaseVault, ammQuoteVault } = ammView

        let baseVaultBal = await getSplTokenAccountBalance(connection, ammBaseVault)
        let quoteVaultBal = await getSplTokenAccountBalance(connection, ammQuoteVault)
        const baseMintKey = `solana:${baseMint}`
        const quoteMintKey = `solana:${quoteMint}`

        for (const position of positions) {
            // Calculate position's share of vault balances
            const share = position.liquidity.mul(PRECISION).div(totalLiquidity)
            const allocBase = baseVaultBal.mul(share).div(PRECISION)
            const allocQuote = quoteVaultBal.mul(share).div(PRECISION)

            balances[baseMintKey] = (balances[baseMintKey] || 0) + Number(allocBase)
            balances[quoteMintKey] = (balances[quoteMintKey] || 0) + Number(allocQuote)
        }
    }

    return balances
}

async function getFutarchyAmmTvl(connection, excludedDaoAddresses) {

    // Fetch DAO accounts and build AMM map
    const daoAccounts = await rpcCall(
        connection.getProgramAccounts.bind(connection),
        FUTARCHY_AMM_PROGRAM_ID,
        { filters: [{ memcmp: { offset: 0, bytes: bs58.encode(getDiscriminator("Dao")) } }] }
    )
    const daoAmmMap = new Map()
    for (const acc of daoAccounts) {
        const daoKey = acc.pubkey.toString()
        if (excludedDaoAddresses.has(daoKey)) continue
        const ammView = decodeDaoAmm(acc.account.data)
        if (ammView) daoAmmMap.set(daoKey, ammView)
    }

    // Fetch LP positions and group by DAO
    const posAccounts = await rpcCall(
        connection.getProgramAccounts.bind(connection),
        FUTARCHY_AMM_PROGRAM_ID,
        { filters: [{ memcmp: { offset: 0, bytes: bs58.encode(getDiscriminator("AmmPosition")) } }] }
    )
    const positionsByDao = {}
    for (const acc of posAccounts) {
        const position = decodeAmmPosition(acc.account.data)
        if (position && daoAmmMap.has(position.dao.toString())) {
            const k = position.dao.toString()
            if (!positionsByDao[k]) positionsByDao[k] = []
            positionsByDao[k].push(position)
        }
    }

    const balances = await calculateDaoLpBalances(connection, daoAmmMap, positionsByDao)
    return balances
}

async function processMeteoraPositions(connection, nftMints) {
    const balances = {}
    // get position PDAs from NFT mints
    const positionPdas = [...nftMints].map(mint => {
        const [pda] = PublicKey.findProgramAddressSync(
            [Buffer.from("position"), new PublicKey(mint).toBuffer()],
            DAMM_PROGRAM_ID
        )
        return pda
    })

    const results = await runInChunks(positionPdas, async (chunk) => {
        const chunkResults = []
        for (const pda of chunk) {
            const decoded = await getMeteoraPositionBalancesManual(connection, pda)
            if (decoded) chunkResults.push(decoded)
        }
        return chunkResults
    }, { sleepTime: SLEEP_MS })

    for (const decoded of results) {
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
            const resp = await rpcCall(
                connection.getParsedTokenAccountsByOwner.bind(connection),
                new PublicKey(vault),
                { programId: PROGRAM }
            )
            accounts.push(...resp.value)
        }

        tokenAccountResults.push(accounts)
    }

    return tokenAccountResults.flat()
}

// Combined TVL
async function tvlAndOwnTokens() {
    const connection = getConnection()

    // Fetch and filter DAOs
    const allDaos = await getAllDaos(connection)
    const daos = allDaos.filter(dao =>
        !EXCLUDED_PAIRS.has(`${dao.daoAddress}/${dao.treasuryVaultAddress}`)
    )
    const excludedDaoAddresses = new Set([...EXCLUDED_PAIRS].map(p => p.split('/')[0]))

    // Calculate Futarchy AMM LP positions
    const ammBalances = await getFutarchyAmmTvl(connection, excludedDaoAddresses)

    // Fetch treasury vault token accounts
    // Deduplicate vaults to reduce RPC calls (some DAOs share the same treasury)
    const allVaults = [...daos.map(d => d.treasuryVaultAddress), METADAO_TREASURY, METADAO_TREASURY_V6]
    const vaults = [...new Set(allVaults)]

    const tokenAccounts = await fetchVaultTokenAccounts(connection, vaults)

    // Extract token account addresses and identify Meteora NFT mints
    const accountAddresses = []
    const nftMints = new Set()
    for (const acc of tokenAccounts) {
        accountAddresses.push(acc.pubkey.toString())
        const info = acc.account.data.parsed.info
        if (info.tokenAmount.amount === "1") nftMints.add(info.mint)
    }

    const meteoraBalances = await processMeteoraPositions(connection, nftMints)

    // Merge all balances
    const mergedBalances = { ...ammBalances }
    for (const [mint, amount] of Object.entries(meteoraBalances)) {
        const key = `solana:${mint}`
        mergedBalances[key] = (mergedBalances[key] || 0) + Number(amount)
    }

    return { tokenAccounts: accountAddresses, balances: mergedBalances }
}

async function tvl() {
    const { tokenAccounts, balances } = await tvlAndOwnTokens()

    return sumTokens2({
        chain: 'solana',
        tokenAccounts,
        balances,
        blacklistedTokens: ["METAwkXcqyXKy1AtsSgJ8JiUHwGCafnZL38n3vYmeta"]
    })
}

async function ownTokens() {
    const { balances } = await tvlAndOwnTokens()
    const metaKey = 'solana:METAwkXcqyXKy1AtsSgJ8JiUHwGCafnZL38n3vYmeta'

    return { [metaKey]: balances[metaKey] || 0 }
}

module.exports = {
    timetravel: false,
    methodology:
        "Sum of Futarchy DAO Squads multisig vault SPL token balances, value of Futarchy DAO owned Meteora DAMM v2 LP positions, and DAO-owned Futarchy AMM LP positions.",
    solana: { tvl, ownTokens },
}