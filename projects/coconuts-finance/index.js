const sdk = require('@defillama/sdk');
const utils = require('../helper/utils');
const abi = require("./abi.json");


function getAvaxTvl(timestamp, block, chainBlocks) {
    return async () => {
        let avaxResponse = await utils.fetchURL(`https://coconutsfinance-test.herokuapp.com/api/apys?network=43114`);
        let balances = {}
        let avaxData = await avaxResponse.data;
        for (let i = 0; i < avaxData.length; i++) {
            let token = avaxData[i].token

            const balance = (await sdk.api.abi.call({
                abi: abi.totalAssets,
                chain: 'avax',
                target: avaxData[i].addr,
                block: chainBlocks.avax
            })).output;

            sdk.util.sumSingleBalance(balances, `avax:${token}`, balance)

        }

        if (balances === 0) {
            throw new Error('avax fetch error')

        }
        return balances;
    }
}

function getPolygonTvl(timestamp, block, chainBlocks) {
    return async () => {
        let polyResponse = await utils.fetchURL(`https://coconutsfinance-test.herokuapp.com/api/apys?network=137`);
        let balances = {}
        let polyData = await polyResponse.data;

        for (let i = 0; i < polyData.length; i++) {
            let token = polyData[i].token

            let balance = (await sdk.api.abi.call({
                abi: abi.totalAssets,
                chain: 'polygon',
                target: polyData[i].addr,
                block
            })).output;

            sdk.util.sumSingleBalance(balances, `polygon:${token}`, balance)

        }

        if (balances === 0) {
            throw new Error(chainId)

        }
        return balances;
    }
}

module.exports = {
    avax: {
        // tvl: getAvaxTvl()
        tvl: () => ({})
    },
    // polygon: {
        // tvl: getPolygonTvl()
    // },
    broken: 'Api is down'
}; 
