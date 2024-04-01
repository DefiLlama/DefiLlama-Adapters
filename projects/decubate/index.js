const sdk = require("@defillama/sdk");

const DCBToken = "0xEAc9873291dDAcA754EA5642114151f3035c67A2";
const stakingPools = [
    "0xD1748192aE1dB982be2FB8C3e6d893C75330884a", // Legacy staking pool contract
    "0xe740758a8cd372c836857defe8011e4e80e48723"  // New staking pools contract
];

async function staking(timestamp, block, chainBlocks) {
    let balances = {};

    for (let pool of stakingPools) {
        let {output: balance} = await sdk.api.erc20.balanceOf({
            target: DCBToken,
            owner: pool,
            block: chainBlocks.bsc,
            chain: "bsc"
        });

        sdk.util.sumSingleBalance(balances, `bsc:${DCBToken}`, balance);
    }

    return balances;
}

module.exports = {
    bsc: {
        tvl: async () => ({}),
        staking
    },
};
