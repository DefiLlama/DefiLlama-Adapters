const sdk = require('@defillama/sdk')
const {get} = require("../helper/http");
const { getChainTransform } = require('../helper/portedTokens')

const abi = {asset: "address:asset", totalAssets: "uint256:totalAssets"};

async function tvl(api, block) {
    const vaults = await get("https://incredbull.io/api/vaults");

    const chain = api.chain;
    const calls = vaults[chain].map(i => ({target: i}));
    const params = {calls, chain, block};

    const {output: tokens} = await sdk.api.abi.multiCall({abi: abi.asset, ...params});
    const {output: totalAssets} = await sdk.api.abi.multiCall({abi: abi.totalAssets, ...params});

    const transform = await getChainTransform(chain);
    const balances = {};
    for (let i = 0; i < tokens.length; i++) {
        sdk.util.sumSingleBalance(balances, transform(tokens[i].output), totalAssets[i].output);
    }

    return balances;
}

module.exports = {
    timetravel: false,
    methodology: 'TVL consist of the sum of every deposit of all vaults for a given asset.',
    btr: {tvl},
};
