const sdk = require("@defillama/sdk");

const DCBToken = "0xEAc9873291dDAcA754EA5642114151f3035c67A2";
const stakingPool = "0xD1748192aE1dB982be2FB8C3e6d893C75330884a";

async function staking (timestamp, block, chainBlocks) {
    let balances = {};

    let {output: balance} =  await sdk.api.erc20.balanceOf({
        target: DCBToken,
        owner: stakingPool,
        block: chainBlocks.bsc,
        chain: "bsc"
    });

    sdk.util.sumSingleBalance(balances, `bsc:${DCBToken}`, balance)

    return balances;
}

module.exports = {
    bsc: {
        tvl: async () => ({}), 
        staking
    },
    
}
