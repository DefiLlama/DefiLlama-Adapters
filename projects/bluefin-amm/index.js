const axios = require('axios');
const ADDRESSES = require('../helper/coreAssets.json')

async function suiTvl(api) {
    try {
        const tvl = (await axios.get('https://swap.api.sui-prod.bluefin.io/api/v1/info')).data.tvl;
        api.add(ADDRESSES.sui.USDC, Number(tvl)*1e6);
        return api.getBalances();
    } catch (error) {
        throw error;
    }
}


module.exports = {
    sui: {
        tvl: suiTvl
    },
}