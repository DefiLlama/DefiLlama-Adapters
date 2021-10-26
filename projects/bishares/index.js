const utils = require('../helper/utils');
const sdk = require("@defillama/sdk");
const { toUSDTBalances } = require("../helper/balances");

const CHAINS = {
    FANTOM: 'fantom',
    BSC: 'bsc'
}

function fetchByChain(chain) {
    return async () => {
        const urlQuery = chain ? `chain=${chain}` : ''
        const result = await utils.fetchURL(`https://stats.bishares.finance/tvl?${urlQuery}`)
        console.log(result.data.total);
        return toUSDTBalances(result.data.total);
    }
}

module.exports = {
    [CHAINS.BSC]: {
        tvl: fetchByChain(CHAINS.BSC)
    },
    [CHAINS.FANTOM]: {
        tvl: fetchByChain(CHAINS.FANTOM)
    },
    tvl: fetchByChain(),
};
