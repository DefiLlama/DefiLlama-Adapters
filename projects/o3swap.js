const { get } = require('./helper/http')

let data

async function getData() {
    if (!data) data = get('https://api.o3swap.com/v1/statistics')
    return data
}

async function fetch() {
    const tvl = await getData()
    let totalTvl = 0
    tvl.data.tvls.forEach(item => {
        totalTvl += +item.tvl
    });
    return totalTvl
}

const chains = {
    ethereum: 1,
    bsc: 56,
    polygon: 137,
    fantom: 250,
    arbitrum: 42161,
    optimism: 10,
    avax: 43114,
    xdai: 100,
    metis: 1088,
    celo: 42220,
    kcc: 321,
    cube: 1818,
    astar: 592,
    bitgert: 32520
}

module.exports = {
    ...Object.entries(chains).reduce((exp, [chain, id]) => {
        return {
            ...exp,
            [chain]: {
                fetch: async () => {
                    const tvl = await getData()
                    return tvl.data.tvls.find(item => item.chain_id === id).tvl
                }
            }
        }
    }, {}),
    fetch,
    deadFrom: '2024-09-30',
}
