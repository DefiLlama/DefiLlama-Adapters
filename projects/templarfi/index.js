
const { default: BigNumber } = require('bignumber.js')
const { call, sumSingleBalance } = require('../helper/chain/near')

// Registry contracts that keep track of all market deployments (in priority order)
const TEMPLAR_REGISTRY_CONTRACTS = [
    'v1.tmplr.near',          // V1 mainnet contract
    // 'templar-alpha.near',  // Alpha/testnet contract, high-effort low reward to add in for now
    // Additional future registry contracts can be added here
]

// Configuration constants
const MAX_RETRY_ATTEMPTS = 3 // Maximum retry attempts for fetching deployments
const RETRY_DELAY_MS = 1000 // Delay between retries in milliseconds
const CALL_TIMEOUT_MS = 30000 // Timeout for each contract call in milliseconds

/**
 * @typedef {Object} Snapshot
 * @property {string} time_chunk - Time chunk information
 * @property {string} end_timestamp_ms - End timestamp in milliseconds
 * @property {string} borrow_asset_deposited_active - Active deposits amount (in borrow asset)
 * @property {string} borrow_asset_deposited_incoming - In-flight deposits amount (in borrow asset)
 * @property {string} collateral_asset_deposited - Deposit amount (in collateral asset)
 * @property {string} borrow_asset_borrowed - Total borrowed amount (in borrow asset)
 * @property {string} yield_distribution - Yield distribution amount
 * @property {string} interest_rate - Current interest rate
 */

/**
 * @typedef {Object} AssetConfig
 * @property {string} [Nep141] - NEP-141 token contract address
 * @property {Object} [Nep245] - NEP-245 token config
 * @property {string} [Nep245.contract_id] - NEP-245 contract ID
 * @property {string} [Nep245.token_id] - NEP-245 token ID
 */

/**
 * @typedef {Object} BalanceOracle
 * @property {string} account_id - Oracle account ID
 * @property {string} collateral_asset_price_id - Collateral asset price ID
 * @property {number} collateral_asset_decimals - Collateral asset decimals
 * @property {string} borrow_asset_price_id - Borrow asset price ID
 * @property {number} borrow_asset_decimals - Borrow asset decimals
 * @property {number} price_maximum_age_s - Maximum price age in seconds
 */

/**
 * @typedef {Object} Configuration
 * @property {AssetConfig} borrow_asset - Borrow asset configuration
 * @property {AssetConfig} collateral_asset - Collateral asset configuration
 * @property {BalanceOracle} balance_oracle - Balance oracle configuration
 * @property {string} protocol_account_id - Protocol account ID
 */

/**
 * Sleep for a specified number of milliseconds for retry logic
 * @param ms - Number of milliseconds to sleep
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Retry wrapper for contract calls
 * @param {Function} fn - Function to retry
 * @param {number} maxAttempts - Maximum retry attempts
 * @param {number} delayMs - Delay between retries
 * @returns {Promise<any>}
 */
async function withRetry(fn, maxAttempts = MAX_RETRY_ATTEMPTS, delayMs = RETRY_DELAY_MS) {
    let lastError

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn()
        } catch (error) {
            lastError = error

            if (attempt === maxAttempts) {
                throw lastError
            }

            console.log(`Attempt ${attempt} failed, retrying in ${delayMs}ms: ${error.message}`)
            await sleep(delayMs)
            delayMs *= 1.5 // Exponential backoff
        }
    }
}

/**
 * Safe contract call with timeout and validation
 * @param {string} contractId - Contract to call
 * @param {string} method - Method to call
 * @param {Object} args - Arguments
 * @returns {Promise<any>}
 */
async function safeCall(contractId, method, args = {}) {
    if (!contractId || typeof contractId !== 'string') {
        throw new Error(`Invalid contract ID: ${contractId}`)
    }
    if (!method || typeof method !== 'string') {
        throw new Error(`Invalid method name: ${method}`)
    }

    return withRetry(async () => {
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error(`Call timeout after ${CALL_TIMEOUT_MS}ms`)), CALL_TIMEOUT_MS)
        })

        const callPromise = call(contractId, method, args)

        return Promise.race([callPromise, timeoutPromise])
    })
}

/**
 * Extract token address from asset configuration
 * @param {AssetConfig} assetConfig - The asset configuration
 * @param {string} assetType - Type of asset for error messages ('borrow' or 'collateral')
 * @returns {string} The token address
 */
function extractTokenAddress(assetConfig, assetType) {
    if (!assetConfig || typeof assetConfig !== 'object') {
        throw new Error(`Invalid ${assetType} asset config: not an object`)
    }

    if (assetConfig.Nep141) {
        if (typeof assetConfig.Nep141 !== 'string' || assetConfig.Nep141.length === 0) {
            throw new Error(`Invalid NEP-141 address for ${assetType} asset`)
        }
        return assetConfig.Nep141
    }

    if (assetConfig.Nep245?.token_id) {
        const tokenId = assetConfig.Nep245.token_id
        if (typeof tokenId !== 'string' || tokenId.length === 0) {
            throw new Error(`Invalid NEP-245 token ID for ${assetType} asset`)
        }

        const parts = tokenId.split(':')
        if (parts.length !== 2) {
            throw new Error(`Invalid NEP-245 token ID format for ${assetType} asset: ${tokenId}`)
        }

        if (parts[0] === 'nep141') {
            if (parts[1].length === 0) {
                throw new Error(`Empty NEP-141 address in NEP-245 token for ${assetType} asset`)
            }
            return parts[1]
        }

        throw new Error(`Unsupported NEP-245 token type for ${assetType} asset: ${parts[0]}`)
    }

    throw new Error(`Unsupported ${assetType} asset format: missing both Nep141 and valid Nep245`)
}

/**
 * Validate snapshot data
 * @param {Snapshot} snapshot - The snapshot to validate
 */
function validateSnapshot(snapshot) {
    if (!snapshot || typeof snapshot !== 'object') {
        throw new Error('Snapshot is not an object')
    }

    const requiredFields = [
        'borrow_asset_deposited_active',
        'borrow_asset_deposited_incoming',
        'borrow_asset_borrowed',
        'collateral_asset_deposited'
    ]

    for (const field of requiredFields) {
        if (typeof snapshot[field] !== 'string') {
            throw new Error(`Invalid snapshot field ${field}: must be string, got ${typeof snapshot[field]}`)
        }

        // Validate it's a valid number string
        if (!/^\d+$/.test(snapshot[field])) {
            throw new Error(`Invalid snapshot field ${field}: not a valid number string: ${snapshot[field]}`)
        }
    }

    for (const field of requiredFields) {
        if (!snapshot || typeof snapshot[field] !== 'string') {
            throw new Error(`Invalid snapshot data: missing or invalid ${field}`)
        }
    }
}

/**
 * Validate configuration with comprehensive checks
 * @param {Configuration} configuration - The configuration to validate
 */
function validateConfiguration(configuration) {
    if (!configuration || typeof configuration !== 'object') {
        throw new Error('Configuration is not an object')
    }

    if (!configuration.borrow_asset) {
        throw new Error('Missing borrow_asset in configuration')
    }

    if (!configuration.collateral_asset) {
        throw new Error('Missing collateral_asset in configuration')
    }
}

/**
 * Fetch all deployments with pagination, trying contracts in priority order
 * @param {string[]} contracts - Array of contract addresses to try in order
 * @returns {Promise<string[]>} Array of deployment contract addresses
 */
async function fetchAllDeployments(contracts) {
    const allDeployments = []
    const errors = []
    const successfulContracts = []

    const contractResults = await Promise.allSettled(
        contracts.map(async (contract) => {
            if (!contract || typeof contract !== 'string') {
                throw new Error(`Invalid contract address: ${contract}`)
            }

            const deployments = await fetchDeploymentsFromContract(contract)
            return { contract, deployments}
        })
    )

    for (const result of contractResults) {
        const index = contractResults.indexOf(result);
        const contract = contracts[index]

        if (result.status === 'fulfilled') {
            const { deployments } = result.value

            if (deployments.length > 0) {
                console.log(`Contract ${contract}: found ${deployments.length} deployments`)
                allDeployments.push(...deployments)
                successfulContracts.push(contract)
            } else {
                console.log(`Contract ${contract}: no deployments found`)
            }
        } else {
            const errorMsg = result.reason?.message || result.reason
            console.log(`Contract ${contract} failed: ${errorMsg}`)
            errors.push(`${contract}: ${errorMsg}`)
        }
    }

    // Remove potential duplicates (in case there was a mistake, or in the future there will be
    // more registries)
    const uniqueDeployments = [...new Set(allDeployments)]

    if (uniqueDeployments.length !== allDeployments.length) {
        console.log(`Removed ${allDeployments.length - uniqueDeployments.length} duplicate deployments`)
    }

    console.log(`Total deployments from ${successfulContracts.length} contracts: ${uniqueDeployments.length}`)

    if (successfulContracts.length > 0) {
        console.log(`Successfully fetched deployments from contracts: ${successfulContracts.join(', ')}`)
        return uniqueDeployments
    }

    throw new Error(`All contracts failed. Errors: ${errors.join('; ')}`)
}

/**
 * Fetch all deployments with pagination
 * @param {string} registryContract - The registry contract address
 * @returns {Promise<string[]>} Array of deployment contract addresses
 */
async function fetchDeploymentsFromContract(registryContract) {
    const deployments = []
    let offset = 0
    const limit = 100
    let hasMore = true

    while (hasMore) {
        const batch = await safeCall(registryContract, 'list_deployments', {
            offset: offset,
            count: limit
        })

        if (!batch || !Array.isArray(batch) || batch.length === 0) {
            hasMore = false
            break
        }

        deployments.push(...batch)
        hasMore = batch.length === limit
        offset += limit
    }

    return deployments
}

/**
 * Process a single market contract and calculate its net contribution to TVL
 *
 * TVL CALCULATION METHODOLOGY:
 * For each market, we calculate net liquidity using the formula:
 * TVL = (Total Deposits - Outstanding Loans) + Collateral Deposits
 *
 * Where:
 * - Total Deposits = borrow_asset_deposited_active + borrow_asset_deposited_incoming
 * - Outstanding Loans = borrowed (amount currently borrowed out)
 * - Collateral Deposits = collateral_asset_deposited (full amount, not netted)
 *
 * This approach ensures:
 * 1. We only count net available liquidity in the borrow asset (deposits minus what's borrowed)
 * 2. We count full collateral since it backs loans but isn't directly borrowed from
 * 3. Each token amount is converted to USD by DefiLlama's sumSingleBalance function
 * 4. Final TVL = Sum of all market contributions converted to USD
 *
 * @param {string} marketContract - The market contract address
 * @returns {Promise<{availableLiquidity: BigNumber, totalBorrowed: (*|BigNumber), totalCollateral: (*|BigNumber), collateralAssetToken: string, borrowAssetToken: string}>}
 */
async function processMarket(marketContract) {
    const [snapshotRaw, configurationRaw] = await Promise.all([
        safeCall(marketContract, 'get_current_snapshot', {}),
        safeCall(marketContract, 'get_configuration', {})
    ])

    /** @type {Snapshot} */
    const snapshot = snapshotRaw
    /** @type {Configuration} */
    const configuration = configurationRaw

    validateSnapshot(snapshot)
    validateConfiguration(configuration)

    if (!configuration?.borrow_asset || !configuration?.collateral_asset) {
        throw new Error('Invalid configuration: missing borrow_asset or collateral_asset')
    }

    const borrowAssetToken = extractTokenAddress(configuration.borrow_asset, 'borrow')
    const collateralAssetToken = extractTokenAddress(configuration.collateral_asset, 'collateral')

    // Calculate amounts in raw format
    const borrow_asset_deposited_active = BigNumber(snapshot.borrow_asset_deposited_active)
    const borrow_asset_deposited_incoming = BigNumber(snapshot.borrow_asset_deposited_incoming)
    const collateral_asset_deposited = BigNumber(snapshot.collateral_asset_deposited)
    const borrow_asset_borrowed = BigNumber(snapshot.borrow_asset_borrowed)

    // Available liquidity = total deposits - outstanding loans
    const availableLiquidity = borrow_asset_deposited_active.plus(borrow_asset_deposited_incoming).minus(borrow_asset_borrowed)

    return {
        borrowAssetToken,
        collateralAssetToken,
        availableLiquidity,
        totalBorrowed: borrow_asset_borrowed,
        totalCollateral: collateral_asset_deposited
    }
}

/**
 * Calculate Total Value Locked (TVL) for Templar Protocol
 *
 * TVL CALCULATION METHODOLOGY:
 * TVL represents the total value of assets available in the protocol, which includes:
 * 1. Available liquidity in borrow assets (deposits minus outstanding loans)
 * 2. Total collateral deposits
 *
 * This follows DeFi standards where TVL shows actual liquidity available in the protocol,
 * not including funds that are currently borrowed out.
 */
async function tvl() {
    const balances = {}

    const deployments = await fetchAllDeployments(TEMPLAR_REGISTRY_CONTRACTS)

    if (deployments.length === 0) {
        console.log('No Templar deployments found for TVL calculation')
        return balances
    }

    const results = await Promise.allSettled(
        deployments.map(processMarket)
    )

    // Process results and add to balances
    results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
            const { borrowAssetToken, collateralAssetToken, availableLiquidity, totalCollateral } = result.value

            sumSingleBalance(balances, borrowAssetToken, availableLiquidity.toFixed())
            sumSingleBalance(balances, collateralAssetToken, totalCollateral.toFixed())
        } else {
            throw new Error(`Market ${deployments[index]} failed: ${result.reason?.message || result.reason}`)
        }
    })

    return balances
}

/**
 * Calculate total borrowed funds across all Templar markets
 */
async function borrowed() {
    const balances = {}

    const deployments = await fetchAllDeployments(TEMPLAR_REGISTRY_CONTRACTS)

    if (deployments.length === 0) {
        console.log('No Templar deployments found for borrowed calculation')
        return balances
    }

    const results = await Promise.allSettled(
        deployments.map(processMarket)
    )

    results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
            const { borrowAssetToken, totalBorrowed } = result.value

            sumSingleBalance(balances, borrowAssetToken, totalBorrowed.toFixed())
        } else {
            throw new Error(`Market ${deployments[index]} failed: ${result.reason?.message || result.reason}`)
        }
    })

    return balances
}

module.exports = {
    methodology: 'TVL is calculated by summing the net borrow asset liquidity (deposits minus outstanding loans) and full collateral deposits for each market deployment.',
    start: 1754902109, // August 11, 2025 08:48:29+UTC
    near: {
        tvl,
        borrowed,
    },
}
