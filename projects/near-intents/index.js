const { httpGet, sumSingleBalance, getTokenBalance } = require('../helper/chain/near')
async function tvl() {
    const balances = {};
    const account = 'intents.near';

    const token_list = "https://api-mng-console.chaindefuser.com/api/tokens/";
    const apiResponse = await httpGet(token_list);

    // Create an array to store token dictionaries
    const tokenArray = [];

    // Process each item in the response and store in array
    apiResponse.items.forEach((token) => {
        // Skip deprecated tokens
        if (token.symbol.includes('DEPRECATED')) {
            return;
        }

        const tokenDict = {
            symbol: token.symbol,
            price: token.price,
            decimals: token.decimals,
            contractAddress: token.defuse_asset_id.split('nep141:')[1],
            defuseAssetId: token.defuse_asset_id,
            priceUpdatedAt: token.price_updated_at,
            blockchain: token.blockchain
        };
        tokenArray.push(tokenDict);
    });

    // Use Promise.all with map to handle async operations properly
    await Promise.all(tokenArray.map(async (token) => {

        const contractAddress = token.contractAddress;

        if (contractAddress) {
            try {
                const balance = await getTokenBalance(contractAddress, account);
                sumSingleBalance(balances, contractAddress, balance);
            } catch (error) {
                console.error(`Error getting balance for ${symbol}:`, error.message);
            }
        }
    }));
    return balances;
}


module.exports = {
    near: {
        tvl,
    },
    methodology: "TVL is calculated by tracking the net amount (deposits - withdrawals) of cross-chain bridged tokens and native tokens on NEAR protocol",
    timetravel: true,
    misrepresentedTokens: false,
    //hallmarks: [
    //    [1727827200, "Initial adapter release"]  // Unix timestamp for 2024-10-01 00:00:00 UTC
    //]
}