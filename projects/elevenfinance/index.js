const utils = require('../helper/utils');

const apiUrl = 'https://eleven.finance/api.json';

function fetchChain(chainId) {
    return async()=>{
        const response = await utils.fetchURL(apiUrl);
        let tvl = parseFloat(response.data.tvlinfo[chainId]);

        if (excludedPools[chainId] !== undefined) {
            excludedPools[chainId].forEach((pool) => {
                tvl -= parseFloat(response.data[pool]?.tvl ?? 0);
            })
        }

        return Math.round(tvl);
    }
}

async function fetch() {
    const response = await utils.fetchURL(apiUrl);
    let tvl = parseFloat(response.data.totalvaluelocked);

    const chains = Object.keys(excludedPools)
    chains.forEach((chainId) => {
        if (excludedPools[chainId] === undefined) {
            return;
        }

        excludedPools[chainId].forEach((pool) => {
            tvl -= parseFloat(response.data[pool]?.tvl ?? 0);
        })
    })

    return Math.round(tvl);
}

module.exports = {
    bsc: {
        fetch: fetchChain('bsc'),
    },
    polygon: {
        fetch: fetchChain('polygon'),
    },
    fantom: {
        fetch: fetchChain('fantom'),
    },
    avalanche: {
        fetch: fetchChain('avax'),
    },
    okexchain: {
        fetch: fetchChain('okexchain'),
    },
    fetch,
}
