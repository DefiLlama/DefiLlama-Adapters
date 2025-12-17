const sdk = require("@defillama/sdk");
const { cachedGraphQuery } = require("../helper/cache");

const graphs = {
    ethereum: sdk.graph.modifyEndpoint('BguCyHCbhwRK4MB4DCFmHLR7KNeDKHE64iDXAY6dp4cR'), 
    base: sdk.graph.modifyEndpoint('5b3mwB9M2TFkD259vzED9sUe8A8j3V2HDobuCgoe8pVh'), 
    optimism: sdk.graph.modifyEndpoint('2tkJQ566D58MzdKzwShZESwgEdTkdWCxCmBKgPyf44bb'), 
    plasma: 'https://api.goldsky.com/api/public/project_cmhc2ll2b3q1q01xw0u0pf76c/subgraphs/odyssey-subgraph-plasma/1.0.4/gn',
}

const queries = {
    current: `query get_current_positions {
        positionRegistries(first: 1) {
            totalDepositedUSD
        }
    }`, 
    previous: `query get_tvl($time_start: BigInt, $time_end: BigInt) {
        positionRegistryDailyDatas(
            first: 1000
            where: {
            blockTimestamp_gt: $time_start
            blockTimestamp_lt: $time_end
            }
        ) {
            id
            totalDepositedUSD
            dayStartTimestamp
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
                let depositedUSD = {}
                const { positionRegistryDailyDatas } = await cachedGraphQuery(`odyssey-${chain}-historical`, graphs[chain], queries.previous, { variables: { time_start: api.timestamp - 60 * 60 * 24, time_end: api.timestamp } })
                positionRegistryDailyDatas.map(({ totalDepositedUSD, id, dayStartTimestamp }) => {
                    const registry = id.substring(0, id.indexOf('-'))
                    if (!depositedUSD[registry]) depositedUSD[registry] = {totalDepositedUSD, dayStartTimestamp }
                    else if (depositedUSD[registry] && depositedUSD[registry].dayStartTimestamp < dayStartTimestamp) depositedUSD[registry] = {totalDepositedUSD, dayStartTimestamp }
                }) 
                Object.values(depositedUSD).map(({ totalDepositedUSD }) => api.addUSDValue(Number(totalDepositedUSD).toFixed(0)))
            } else {
                // do current query
                const { positionRegistries } = await cachedGraphQuery(`odyssey-${chain}-current-2`, graphs[chain], queries.current)
                api.addUSDValue(Number(positionRegistries[0].totalDepositedUSD).toFixed(0))
            }
            return api.getBalances()
        }
    }
})