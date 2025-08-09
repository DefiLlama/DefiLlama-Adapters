
const { default: BigNumber } = require('bignumber.js')
const { call, sumSingleBalance } = require('../helper/chain/near')

// Root contract that keeps track of all market deployments
const TEMPLAR_ROOT_ALPHA_CONTRACT = 'templar-alpha.near'

/**
 * @typedef {Object} Snapshot
 * @property {string} time_chunk - Time chunk information
 * @property {string} end_timestamp_ms - End timestamp in milliseconds
 * @property {string} borrow_asset_deposited_active - Active deposits amount (in borrow asset)
 * @property {string} borrow_asset_deposited_inflight - In-flight deposits amount (in borrow asset)
 * @property {string} collateral_asset_deposited - Deposit amount (in collateral asset)
 * @property {string} borrowed - Total borrowed amount (in borrow asset)
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
 * Extract token address from asset configuration
 * @param {AssetConfig} assetConfig - The asset configuration
 * @param {string} assetType - Type of asset for error messages ('borrow' or 'collateral')
 * @returns {string} The token address
 */
function extractTokenAddress(assetConfig, assetType) {
    if (assetConfig.Nep141) {
        return assetConfig.Nep141
    }

    if (assetConfig.Nep245?.token_id) {
        const tokenId = assetConfig.Nep245.token_id
        const parts = tokenId.split(':')

        if (parts.length === 2 && parts[0] === 'nep141') {
            return parts[1]
        }

        throw new Error(`Unsupported NEP-245 token type for ${assetType} asset: ${parts[0] || 'unknown'}`)
    }

    throw new Error(`Unsupported ${assetType} asset format`)
}

/**
 * Validate snapshot data
 * @param {Snapshot} snapshot - The snapshot to validate
 */
function validateSnapshot(snapshot) {
    const requiredFields = [
        'borrow_asset_deposited_active',
        'borrowed',
        'collateral_asset_deposited'
    ]

    for (const field of requiredFields) {
        if (!snapshot || typeof snapshot[field] !== 'string') {
            throw new Error(`Invalid snapshot data: missing or invalid ${field}`)
        }
    }
}

/**
 * Fetch all deployments with pagination
 * @param {string} rootContract - The root contract address
 * @returns {Promise<string[]>} Array of deployment contract addresses
 */
async function fetchAllDeployments(rootContract) {
    const deployments = []
    let offset = 0
    const limit = 100
    let hasMore = true

    while (hasMore) {
        const batch = await call(rootContract, 'list_deployments', {
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
 * - Total Deposits = borrow_asset_deposited_active + borrow_asset_deposited_inflight
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
 * @returns {Promise<{netBorrowed: BigNumber, netCollateral: BigNumber, collateralAssetToken: string, borrowAssetToken: string}>}
 */
async function processMarket(marketContract) {
    const [snapshotRaw, configurationRaw] = await Promise.all([
        call(marketContract, 'get_current_snapshot', {}),
        call(marketContract, 'get_configuration', {})
    ])

    /** @type {Snapshot} */
    const snapshot = snapshotRaw
    /** @type {Configuration} */
    const configuration = configurationRaw

    validateSnapshot(snapshot)

    if (!configuration?.borrow_asset || !configuration?.collateral_asset) {
        throw new Error('Invalid configuration: missing borrow_asset or collateral_asset')
    }

    const borrowAssetToken = extractTokenAddress(configuration.borrow_asset, 'borrow')
    const collateralAssetToken = extractTokenAddress(configuration.collateral_asset, 'collateral')

    // Calculate net liquidity in raw amounts
    const totalBorrowDeposited = BigNumber(snapshot.borrow_asset_deposited_active)
    const totalBorrowInflight = BigNumber(snapshot.borrow_asset_deposited_inflight)
    const netCollateral = BigNumber(snapshot.collateral_asset_deposited)
    const totalBorrowed = BigNumber(snapshot.borrowed)
    const netBorrowed = totalBorrowDeposited.plus(totalBorrowInflight).minus(totalBorrowed)

    return { borrowAssetToken, collateralAssetToken, netBorrowed, netCollateral }
}

/**
 * Calculate Total Value Locked (TVL) for Templar Protocol
 *
 * OVERALL TVL CALCULATION:
 * 1. For each market deployment:
 *    - Calculate net borrow asset liquidity = total borrow deposits - outstanding loans
 *    - Include full collateral deposits
 * 2. Return all borrow and collateral assets with their net amounts
 *
 * This methodology follows DeFi standards where TVL represents actual value
 * locked in the protocol, accounting for outstanding obligations.
 */
async function tvl() {
    const balances = {}

    try {
        const deployments = await fetchAllDeployments(TEMPLAR_ROOT_ALPHA_CONTRACT)

        if (deployments.length === 0) {
            console.log('No Templar deployments found')
            return balances
        }

        const results = await Promise.allSettled(
            deployments.map(processMarket)
        )

        // Process results and add to balances
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                const { borrowAssetToken, collateralAssetToken, netBorrowed, netCollateral } = result.value

                sumSingleBalance(balances, borrowAssetToken, netBorrowed.toFixed())
                sumSingleBalance(balances, collateralAssetToken, netCollateral.toFixed())
            } else {
                console.log(`Error processing market ${deployments[index]}:`, result.reason)
            }
        })

    } catch (err) {
        console.log(`Error fetching deployments from ${TEMPLAR_ROOT_ALPHA_CONTRACT}:`, err)
    }

    return balances
}

module.exports = {
    methodology: 'TVL is calculated by summing the net borrow asset liquidity (deposits minus outstanding loans) and full collateral deposits for each market deployment.',
    start: 1747976677, // Fri May 23 2025 05:04:37 TODO: update this to the actual start date of Templar Protocol post-alpha launch
    near: {
        tvl,
    },
}