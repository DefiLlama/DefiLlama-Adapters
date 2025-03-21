const ADDRESSES = require('../helper/coreAssets.json');
const axios = require('axios');

const tvl = async (api) => {
    const balanceInXRP = await dopplerApi();
    api.add(ADDRESSES.ripple.XRP, balanceInXRP * 10 ** 6)
}

const dopplerApi = async (api) => {
    const response = await axios.get("https://api.doppler.finance/v1/xrpfi/staking-info");
    return response.data[0].totalStaked;
}

module.exports = {
    ripple: { tvl },
}