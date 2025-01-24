const BigNumber = require("bignumber.js");
const axios = require("axios");

const fetch = async () => {
    const res = await axios.get("https://data.bonzo.finance/market");
    const result = {};
    for (const reserve of res.data.reserves) {
        result[`hedera:${reserve.evm_address}`] = new BigNumber(reserve.total_reserve.tiny_token).toString();
    }
    return result;
};

module.exports = {
    misrepresentedTokens: true,
    methodology: "The Treasury holds aToken balances, but reports using corresponding HTS token addresses to facilitate proper USD value calculations by DeFi Llama's pricing API.",
    hedera: {
        tvl: fetch
    }
};
