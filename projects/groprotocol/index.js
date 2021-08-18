// Adapter for Gro Protocol : https://gro.xyz

const sdk = require("@defillama/sdk");
const groTokenAbi = require('./abi.json');

const PWRD = "0xf0a93d4994b3d98fb5e3a2f90dbc2d69073cb86b";
const GVT = "0x3ADb04E127b9C0a5D36094125669d4603AC52a0c";
const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";

async function tvl(timestamp, ethBlock) {

    let balances = {};

    for (const token of [PWRD, GVT]) {
        const current = await sdk.api.abi.call({
            target: token,
            abi: groTokenAbi["totalAssets"],
            block: ethBlock,
        });
        sdk.util.sumSingleBalance(balances, DAI, current.output);
    }

    return balances;
}

module.exports = {
    ethereum:{
        tvl,
    },
    name: 'Gro',
    token: null,
    category: 'assets',
    start: 1622204347,  // 28-05-2021 12:19:07 (UTC)
    methodology: "Using DAI as a placeholder with same 18 decimals until coins listed on coingecko. The totalAssets() call returns USD value",
    tvl,
};
