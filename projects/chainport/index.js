const utils = require('../helper/utils');

async function fetchByNetwork(network_name) {
    let tvl = await utils.fetchURL('https://api.chainport.io/api/tvl_per_chain')

    return tvl.data[network_name]
}

module.exports = {
    methodology: "assets in liquidity are counted as TVL",
    ethereum: {
        tvl: fetchByNetwork('ETHEREUM')
    },
    polygon: {
        tvl: fetchByNetwork('POLYGON')
    },
    bsc: {
        tvl: fetchByNetwork('BSC')
    },
    fantom: {
        tvl: fetchByNetwork('FANTOM')
    }
}
