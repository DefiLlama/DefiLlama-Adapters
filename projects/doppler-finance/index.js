const ADDRESSES = require('../helper/coreAssets.json');
const axios = require('axios');

const NODE_URL = "https://xrplcluster.com";

const tvl = async (api) => {
    const address = "rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De";
    const tokenCurrency = "524C555344000000000000000000000000000000";
    
    const payload = {
        method: "gateway_balances",
        params: [{
            account: address,
            ledger_index: "validated"
        }]
    };

    const { data } = await axios.post(NODE_URL, payload);
    const balanceInDrops = data.result.obligations[tokenCurrency];
    api.add(ADDRESSES.ripple.XRP, balanceInDrops)
}

module.exports = {
    ripple: { tvl }
}