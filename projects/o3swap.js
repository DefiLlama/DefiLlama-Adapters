const { default: BigNumber } = require('bignumber.js');
const { fetchURL } = require('./helper/utils')

async function fetch() {
    const tvl = await fetchURL('https://api.o3swap.com/v1/statistics')
    let totalTvl = new BigNumber(0)
    tvl.data.data.tvls.forEach(item => {
        totalTvl = totalTvl.plus(new BigNumber(item.tvl))
    });
    return totalTvl.toFixed();
}

const chains = {
    ethereum: 1,
    bsc: 56,
    polygon: 137,
    fantom: 250,
    arbitrum: 42161,
    optimism: 10,
    xdai: 100,
}

module.exports = {
    ...Object.entries(chains).reduce((exp, [chain, id]) => {
        return {
            ...exp,
            [chain]: {
                fetch: async () => {
                    const tvl = await fetchURL('https://api.o3swap.com/v1/statistics')
                    return tvl.data.data.tvls.find(item => item.chain_id === id).tvl
                }
            }
        }
    }, {}),
    fetch,
}
