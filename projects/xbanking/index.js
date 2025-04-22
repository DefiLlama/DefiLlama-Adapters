const ADDRESSES = require('../helper/coreAssets.json');
const axios = require('axios');

const XB_API_URL = "https://api.xbanking.org:3444/tvl/solana";
// ref: https://xbanking.medium.com/xbanking-is-the-safest-defi-platform-94c9833bc5c6
// Our custodial services operate similarly to CEX wallets, making it impossible to track xbanking's full balance on-chain
// Our api response is sum of fireblocks and custodial services balance
const tvl = async (api) => {
    const { data } = await axios.get(XB_API_URL);
    if (!data || !data[0]) {
        throw new Error('Invalid API response');
    }

    const stakingInfo = data[0];
    const { totalStaked } = stakingInfo;

    api.add(ADDRESSES.solana.SOL, totalStaked);
}

module.exports = {
    solana: {
        tvl
    }
};
