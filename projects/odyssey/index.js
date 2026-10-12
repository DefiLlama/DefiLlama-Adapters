const sdk = require("@defillama/sdk");
const { cachedGraphQuery } = require("../helper/cache");

const graphs = {
    ethereum: sdk.graph.modifyEndpoint('BguCyHCbhwRK4MB4DCFmHLR7KNeDKHE64iDXAY6dp4cR'), 
    base: sdk.graph.modifyEndpoint('5b3mwB9M2TFkD259vzED9sUe8A8j3V2HDobuCgoe8pVh'), 
    optimism: sdk.graph.modifyEndpoint('2tkJQ566D58MzdKzwShZESwgEdTkdWCxCmBKgPyf44bb'), 
    plasma: 'https://api.goldsky.com/api/public/project_cmhc2ll2b3q1q01xw0u0pf76c/subgraphs/odyssey-subgraph-plasma/1.0.8/gn',
    robinhood: 'https://api.goldsky.com/api/public/project_cmhc2ll2b3q1q01xw0u0pf76c/subgraphs/odyssey-subgraph-robinhood/1.0.8/gn',
}

// The Graph returns 100 entities per list unless told otherwise, so smart accounts are paged
const PAGE_SIZE = 1000

const queries = {
    current: `query get_current_positions($first: Int, $skip: Int) {
        positionRegistries(first: 1) {
            smartAccounts(first: $first, skip: $skip) {
                positions(first: 1000, where: {totalDeposited_gt: 0}) {
                    totalDeposited
                    asset
                }
            }
        }
    }`, 
    previous: `query get_tvl($time_start: BigInt, $time_end: BigInt, $first: Int, $skip: Int) {
        positionRegistrySnapshots(
            first: 1000
            where: {
                createdAt_gt: $time_start
                createdAt_lt: $time_end
            }
        ) {
            id
    		dayStartTimestamp
            smartAccountSnapshots(first: $first, skip: $skip) {
                positionSnapshots(first: 1000, where: {totalDeposited_gt: 0}) {
                    totalDeposited
                    position {
                        asset
                    }
                }
            }
        }
    }`
}

module.exports = {
    misrepresentedTokens: true, 
    methodology: 'TVL is the sum of the assets deposited in open positions held by Odyssey smart accounts, read from the position registry subgraph of each chain.',
}

Object.keys(graphs).forEach(chain => {
    module.exports[chain] = {
        tvl: async (api) => {
            if ( Date.now() / 1000 - api.timestamp > 60 * 60 * 24 ) {
                // do historical query
                const snapshots = {}
                let skip = 0
                let hasMore
                do {
                    hasMore = false
                    const { positionRegistrySnapshots } = await cachedGraphQuery(`odyssey-${chain}-historical-${skip}`, graphs[chain], queries.previous, { variables: { time_start: api.timestamp - 60 * 60 * 24, time_end: api.timestamp, first: PAGE_SIZE, skip } })
                    ;(positionRegistrySnapshots || []).forEach(({ smartAccountSnapshots, id, dayStartTimestamp }) => {
                        if (smartAccountSnapshots.length === PAGE_SIZE) hasMore = true
                        if (!snapshots[id]) snapshots[id] = { balances: {}, dayStartTimestamp }
                        const { balances } = snapshots[id]
                        smartAccountSnapshots.forEach(saSnapshot => {
                            saSnapshot.positionSnapshots.forEach(positionSnapshot => {
                                const asset = positionSnapshot.position.asset
                                const amount = Number(positionSnapshot.totalDeposited)
                                if (!balances[asset]) balances[asset] = 0
                                balances[asset] += amount
                            })
                        })
                    })
                    skip += PAGE_SIZE
                } while (hasMore)
                // keep the latest snapshot of each registry
                const depositedBalances = {}
                Object.entries(snapshots).forEach(([id, snapshot]) => {
                    const registry = id.substring(0, id.indexOf('-'))
                    if (!depositedBalances[registry] || depositedBalances[registry].dayStartTimestamp < snapshot.dayStartTimestamp) depositedBalances[registry] = snapshot
                })
                Object.values(depositedBalances).forEach(({ balances }) => {
                    Object.entries(balances).forEach(([asset, amount]) => {
                        api.add(asset, amount)
                    })
                })
            } else {
                // do current query
                const balances = {}
                let skip = 0
                let smartAccounts
                do {
                    const { positionRegistries } = await cachedGraphQuery(`odyssey-${chain}-current-2-${skip}`, graphs[chain], queries.current, { variables: { first: PAGE_SIZE, skip } })
                    smartAccounts = (positionRegistries && positionRegistries[0] && positionRegistries[0].smartAccounts) || []
                    smartAccounts.forEach(smartAccount => {
                        smartAccount.positions.forEach(position => {
                            const asset = position.asset
                            const amount = Number(position.totalDeposited)
                            if (!balances[asset]) balances[asset] = 0
                            balances[asset] += amount
                        })
                    })
                    skip += PAGE_SIZE
                } while (smartAccounts.length === PAGE_SIZE)
                Object.entries(balances).forEach(([asset, amount]) => {
                    api.add(asset, amount)
                })
            }
            return api.getBalances()
        }
    }
})