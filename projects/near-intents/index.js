const { httpGet, sumSingleBalance } = require('../helper/chain/near')

async function tvl(api) {
    const balances = {};

    const api_tvl = "https://flipsidecrypto.xyz/api/v1/queries/912162c9-22f1-46d9-88a1-1059b8f0b6b3/data/latest";
    const assetsCallResponse = await httpGet(api_tvl);

    // Process each item in the response
    assetsCallResponse.forEach((item) => {
        const token = item.SYMBOL;
        const balance = item.NET_TOKENS_MINTED_USD || 0;

        if (token) {
            sumSingleBalance(balances, token, balance);
        }
    });

    return balances;
}

module.exports = {
    near: {
        tvl,
    },
    methodology: "TVL is calculated by tracking the net amount (deposits - withdrawals) of cross-chain bridged tokens and native tokens on NEAR protocol, with data sourced from Flipside Crypto",
    timetravel: true,
    misrepresentedTokens: false,
    hallmarks: [
        [1727827200, "Initial adapter release"]  // Unix timestamp for 2024-10-01 00:00:00 UTC
    ]
}