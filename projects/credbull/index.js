const sdk = require('@defillama/sdk')
const {get} = require("../helper/http");

const abi = {asset: "address:asset", totalAssets: "uint256:totalAssets"};

async function tvl(_, block, chain) {
    const vaults = await get("https://incredbull.io/api/vaults");
    const calls = vaults[chain].map(i => ({target: i}));

    const {output: tokens} = await sdk.api.abi.multiCall({
        abi: abi.asset, calls, chain, block,
    });

    const {output: totalAssets} = await sdk.api.abi.multiCall({
        abi: abi.totalAssets, calls, chain, block,
    });

    const balances = {}
    for (let i = 0; i < tokens.length; i++) {
        sdk.util.sumSingleBalance(balances, tokens[i].output, totalAssets[i].output);
    }

    return balances
}

module.exports = {
    timetravel: false,
    btr: {tvl: (a, b) => tvl(a, b, "btr")},
};
