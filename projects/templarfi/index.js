const { default: BigNumber } = require('bignumber.js')
const { call, sumSingleBalance } = require('../helper/chain/near')

// Root contract that keeps track of all market deployments
const TEMPLAR_ROOT_CONTRACT = 'templar-alpha.near'

/**
 * @typedef {Object} Snapshot
 * @property {string} time_chunk - Time chunk information
 * @property {string} end_timestamp_ms - End timestamp in milliseconds
 * @property {string} deposited_active - Active deposits amount
 * @property {string} deposited_incoming - Incoming deposits amount
 * @property {string} borrowed - Total borrowed amount
 * @property {string} yield_distribution - Yield distribution amount
 * @property {string} interest_rate - Current interest rate
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
                /** @type {Snapshot} */
                const snapshot = await call(marketContract, 'get_current_snapshot', {})

                if (!snapshot || typeof snapshot.deposited_active !== 'string' || typeof snapshot.borrowed !== 'string') {
                    throw new Error('Invalid snapshot data received')
                }

                const totalDeposited = BigNumber(snapshot.deposited_active)
                    .plus(snapshot.deposited_incoming)
                const totalBorrowed = BigNumber(snapshot.borrowed)
                const netLiquidity = totalDeposited.minus(totalBorrowed)

                return { marketContract, netLiquidity }
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
