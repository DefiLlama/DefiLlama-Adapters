const utils = require('../helper/utils');
// Please refer to Github(https://github.com/kukafe/kafe-defillama/tree/main/kafe-defillama) for the codes to calculate the TVL via on-chain calls
const apiUrl = 'http://142.93.53.244:5001/getTvl'; 

function fetchChain(chainId) {
    return async()=>{
    let response = await utils.fetchURL(apiUrl);
    let tvl = parseFloat(response.data.tvlinfo[chainId]);
    return Math.round(tvl);
    }
}

async function fetch() {
    let response = await utils.fetchURL(apiUrl);
    let tvl = parseFloat(response.data.totalValueLocked);
    return Math.round(tvl);
}

module.exports = {
    moonriver: {
        fetch: fetchChain('moonriver'),
    },
    cronos: {
        fetch: fetchChain('cronos'),
    },
    fetch
    }
