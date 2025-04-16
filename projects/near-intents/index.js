const { httpGet } = require("../helper/chain/near")
const { sumSingleBalance } = require('../helper/chain/near')

function tvl() {
    return async () => {
        const balances = {};

        const api_tvl = "https://flipsidecrypto.xyz/api/v1/queries/912162c9-22f1-46d9-88a1-1059b8f0b6b3/data/latest";
        const assetsCallResponse = await httpGet(api_tvl);

        // Process each item in the response
        assetsCallResponse.forEach((item) => {
            const token = item.SYMBOL;
            const balance = item.NET_TOKENS_MINTED_USD;
            sumSingleBalance(balances, token, balance);
        });

        return balances;
    }
}

module.exports = {
    near: {
        tvl
    }
}