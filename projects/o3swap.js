const { fetchURL } = require('./helper/utils')

async function fetch() {
    const tvl = await fetchURL('https://monitor.api.o3swap.com/v1/statistics')
    return tvl.data.data.pool_tvl
}
async function fetchEthereum(poolIndex) {
    const tvl = await fetchURL('https://monitor.api.o3swap.com/v1/statistics')
    return tvl.data.data.pools[0].tvl
}
async function fetchBsc() {
    const tvl = await fetchURL('https://monitor.api.o3swap.com/v1/statistics')
    return tvl.data.data.pools[1].tvl
}
async function fetchHeco() {
    const tvl = await fetchURL('https://monitor.api.o3swap.com/v1/statistics')
    return tvl.data.data.pools[2].tvl
}
async function fetchPolygon() {
    const tvl = await fetchURL('https://monitor.api.o3swap.com/v1/statistics')
    return tvl.data.data.pools[3].tvl
}
async function fetchArbitrum() {
    const tvl = await fetchURL('https://monitor.api.o3swap.com/v1/statistics')
    return tvl.data.data.pools[4].tvl
}

module.exports = {
    ethereum: {
        fetch: fetchEthereum,
    },
    bsc: {
        fetch: fetchBsc,
    },
    heco: {
        fetch: fetchHeco,
    },
    polygon: {
        fetch: fetchPolygon,
    },
    arbitrum: {
        fetch: fetchArbitrum,
    },
    fetch,
}
