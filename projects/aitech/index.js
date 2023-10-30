const sdk = require("@defillama/sdk");

const aitechStakingContract = '0x2C4dD7db5Ce6A9A2FB362F64fF189AF772C31184';
const aitechTokenContract = '0x2D060Ef4d6BF7f9e5edDe373Ab735513c0e4F944';

async function staking (timestamp, block, chainBlocks) {
    let balances = {};

    let {output: balance} =  await sdk.api.erc20.balanceOf({
        target: aitechTokenContract,
        owner: aitechStakingContract,
        block: chainBlocks.bsc,
        chain: "bsc"
    });

    sdk.util.sumSingleBalance(balances, `bsc:${aitechTokenContract}`, balance)

    return balances;
}

module.exports = {
    bsc: {
        tvl: staking
    },
    
}
