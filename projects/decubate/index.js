const sdk = require("@defillama/sdk");

const DCBToken = "0xEAc9873291dDAcA754EA5642114151f3035c67A2";
const stakingPool = "0x22B551fE288c93A3Ac9172aD998A1D9ce1A882e5";

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
    tvl: async () => ({})
    
}