const { default: BigNumber } = require('bignumber.js')
const { call, sumSingleBalance } = require('../helper/chain/near')

// Root contract that keeps track of all market deployments
const TEMPLAR_ROOT_CONTRACT = 'templar-alpha.near'

/**
 * @typedef {Object} Snapshot
 * @property {string} time_chunk - Time chunk information
 * @property {string} end_timestamp_ms - End timestamp in milliseconds
 * @property {string} deposited_active - Active deposits amount (in borrow asset)
 * @property {string} deposited_incoming - Incoming deposits amount (in borrow asset)
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

async function tvl() {
    const balances = {}

    try {
        // Get all market deployments from the root contract with pagination
        let deployments = []
        let offset = 0
        const limit = 100 // Reasonable batch size
        let hasMore = true

        while (hasMore) {
            const deploymentsBatch = await call(TEMPLAR_ROOT_CONTRACT, 'list_deployments', {
                offset: offset,
                count: limit
            })

            if (!deploymentsBatch || !Array.isArray(deploymentsBatch) || deploymentsBatch.length === 0) {
                hasMore = false
                break
            }

            deployments = deployments.concat(deploymentsBatch)

            // If we got fewer than the limit, we're done
            if (deploymentsBatch.length < limit) {
                hasMore = false
            } else {
                offset += limit
            }
        }

        if (deployments.length === 0) {
            console.log('No Templar deployments found')
            return balances
        }

        const results = await Promise.allSettled(
            deployments.map(async (marketContract) => {
                const [snapshotRaw, configurationRaw] = await Promise.all([
                    call(marketContract, 'get_current_snapshot', {}),
                    call(marketContract, 'get_configuration', {})
                ])

                /** @type {Snapshot} */
                const snapshot = snapshotRaw
                /** @type {Configuration} */
                const configuration = configurationRaw

                if (!snapshot ||
                    typeof snapshot.deposited_active !== 'string' ||
                    typeof snapshot.deposited_incoming !== 'string' ||
                    typeof snapshot.borrowed !== 'string') {
                    throw new Error('Invalid snapshot data received')
                }

                if (!configuration || !configuration.borrow_asset || !configuration.borrow_asset.Nep141) {
                    throw new Error('Invalid configuration or missing borrow asset')
                }

                const borrowAssetToken = configuration.borrow_asset.Nep141
                const borrowAssetDecimals = configuration.balance_oracle?.borrow_asset_decimals || 18

                // Calculate net liquidity in raw amounts (all in borrow asset)
                const totalDeposited = BigNumber(snapshot.deposited_active)
                    .plus(snapshot.deposited_incoming)
                const totalBorrowed = BigNumber(snapshot.borrowed)
                const netLiquidity = totalDeposited.minus(totalBorrowed)

                return { marketContract, borrowAssetToken, netLiquidity, borrowAssetDecimals }
            })
        )

        // Process results and add to balances
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                const { marketContract, netLiquidity } = result.value

                sumSingleBalance(balances, marketContract, netLiquidity.toFixed())
            } else {
                console.log(`Error processing market ${deployments[index]}:`, result.reason)
            }
        })

    } catch (err) {
        console.log(`Error fetching deployments from ${TEMPLAR_ROOT_CONTRACT}:`, err)
    }

    return balances
}

module.exports = {
    near: {
        tvl,
    },
}
