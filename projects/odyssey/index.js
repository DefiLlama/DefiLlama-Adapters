const sdk = require("@defillama/sdk");
const { cachedGraphQuery } = require("../helper/cache");

const graphs = {
    ethereum: sdk.graph.modifyEndpoint('BguCyHCbhwRK4MB4DCFmHLR7KNeDKHE64iDXAY6dp4cR'), 
    base: sdk.graph.modifyEndpoint('5b3mwB9M2TFkD259vzED9sUe8A8j3V2HDobuCgoe8pVh'), 
    optimism: sdk.graph.modifyEndpoint('2tkJQ566D58MzdKzwShZESwgEdTkdWCxCmBKgPyf44bb'), 
    plasma: 'https://api.goldsky.com/api/public/project_cmhc2ll2b3q1q01xw0u0pf76c/subgraphs/odyssey-subgraph-plasma/1.0.7/gn',
}

const queries = {
    current: `query get_current_positions {
        positionRegistries(first: 1) {
            smartAccounts {
                positions(where: {totalDeposited_gt: 0}) {
                    totalDeposited
                    asset
                }
            }
        }
    }`, 
    previous: `query get_tvl($time_start: BigInt, $time_end: BigInt) {
        positionRegistrySnapshots(
            first: 1000
            where: {
                createdAt_gt: $time_start
                createdAt_lt: $time_end
            }
        ) {
            id
    		dayStartTimestamp
            smartAccountSnapshots {
                positionSnapshots(where: {totalDeposited_gt: 0}) {
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
}

Object.keys(graphs).forEach(chain => {
    module.exports[chain] = {
        tvl: async (api) => {
            if ( Date.now() / 1000 - api.timestamp > 60 * 60 * 24 ) {
                // do historical query
                let depositedBalances = {}
                const { positionRegistrySnapshots } = await cachedGraphQuery(`odyssey-${chain}-historical`, graphs[chain], queries.previous, { variables: { time_start: api.timestamp - 60 * 60 * 24, time_end: api.timestamp } })
                if (positionRegistrySnapshots && positionRegistrySnapshots.length > 0) {
                    positionRegistrySnapshots.forEach(({ smartAccountSnapshots, id, dayStartTimestamp }) => {
                        const registry = id.substring(0, id.indexOf('-'))
                        const balances = {}
                        smartAccountSnapshots.forEach(saSnapshot => {
                            saSnapshot.positionSnapshots.forEach(positionSnapshot => {
                                const asset = positionSnapshot.position.asset
                                const amount = Number(positionSnapshot.totalDeposited)
                                if (!balances[asset]) balances[asset] = 0
                                balances[asset] += amount
                            })
                        })
                        if (!depositedBalances[registry]) depositedBalances[registry] = {balances, dayStartTimestamp }
                        else if (depositedBalances[registry] && depositedBalances[registry].dayStartTimestamp < dayStartTimestamp) depositedBalances[registry] = {balances, dayStartTimestamp }
                    }) 
                    Object.values(depositedBalances).forEach(({ balances }) => {
                        Object.entries(balances).forEach(([asset, amount]) => {
                            api.add(asset, amount)
                        })
                    })
                }
            } else {
                // do current query
                const { positionRegistries } = await cachedGraphQuery(`odyssey-${chain}-current-2`, graphs[chain], queries.current)
                const balances = {}
                if (positionRegistries && positionRegistries[0] && positionRegistries[0].smartAccounts) {
                    positionRegistries[0].smartAccounts.forEach(smartAccount => {
                        smartAccount.positions.forEach(position => {
                            const asset = position.asset
                            const amount = Number(position.totalDeposited)
                            if (!balances[asset]) balances[asset] = 0
                            balances[asset] += amount
                        })
                    })
                }
                Object.entries(balances).forEach(([asset, amount]) => {
                    api.add(asset, amount)
                })
            }
            return api.getBalances()
        }
    }
})