const { fetchURL } = require('./helper/utils')

async function fetch() {
    const tvl = await fetchURL('https://monitor.api.o3swap.com/v1/statistics')
    return tvl.data.data.pool_tvl
}

const chainsToIndex = {
    ethereum: 0,
    bsc: 1,
    heco: 2,
    polygon: 3,
    arbitrum: 4,
    okexchain: 5,
    avalanche: 6,
}

module.exports = {
    ...Object.entries(chainsToIndex).reduce((exp, [chain, id]) => {
        return {
            ...exp,
            [chain]: {
                fetch: async () => {
                    const tvl = await fetchURL('https://monitor.api.o3swap.com/v1/statistics')
                    return tvl.data.data.pools[id].tvl
                }
            }
        }
    }, {}),
    fetch,
}
