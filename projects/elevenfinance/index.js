const utils = require('../helper/utils');

const apiUrl = 'https://eleven.finance/api.json';

async function fetchChain(chainId) {
    const response = await utils.fetchURL(apiUrl);
    const tvl = parseFloat(response.tvlinfo[chainId]);
    return Math.round(tvl);
}

async function fetch() {
    const response = await utils.fetchURL(apiUrl);
    const tvl = parseFloat(response.totalvaluelocked);
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
