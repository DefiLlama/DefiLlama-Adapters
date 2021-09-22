const utils = require('../helper/utils');

const apiUrl = 'https://eleven.finance/api.json';

const excludedPools = {
    'polygon': [
        'ELE ',
        'ELE-MUST cLP',
        'ELE-QUICK qLP',
        'ELE-MATIC cLP',
        'ELE-MATIC qLP',
        'ELE-MATIC SLP',
        'ELE-MATIC WLP',
        'ELE-USDC DLP',
        'ELE-DFYN DLP',
    ],
    'fantom': [
        'ELE-WFTM SLP',
    ],
    'bsc': [
        'ELE',
        'ELE-BNB WLP',
        'ELE-BNB LP V2',
    ],
    'avax': [
        'ELE-WAVAX TLP',
        'ELE-WAVAX PLP',
        'ELE-PNG PLP',
        'ELE  ',
    ],
    'okexchain': [
        'ELE-USDT PLP',
    ],
};

async function fetchChain(chainId) {
    const response = await utils.fetchURL(apiUrl);
    let tvl = parseFloat(response.data.tvlinfo[chainId]);

    if (excludedPools[chainId] !== undefined) {
        excludedPools[chainId].forEach((pool) => {
            tvl -= parseFloat(response.data[pool]['tvl']);
        })
    }

    return Math.round(tvl);
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
            tvl -= parseFloat(response.data[pool]['tvl']);
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
