const ADDRESSES = require('../helper/coreAssets.json');
const axios = require('axios');

const NODE_URL = "https://xrplcluster.com";

const tvl = async (api) => {
    const address = "rprFy94qJB5riJpMmnPDp3ttmVKfcrFiuq";
    
    const payload = {
        method: "account_info",
        params: [{
            account: address,
            ledger_index: "validated"
        }]
    };

    const { data } = await axios.post(NODE_URL, payload);
    const balanceInDrops = data.result.account_data.Balance;
    api.add(ADDRESSES.ripple.XRP, balanceInDrops)
}

module.exports = {
    ripple: { tvl }
}