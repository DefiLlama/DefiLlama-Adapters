const sdk = require("@defillama/sdk");
const ADDRESSES = require('../helper/coreAssets.json')

const tvlContracts = [
    {
        address: '0x98257C876ACe5009e7B97843F8c71b3AE795c71E', // AMMrouter
        token: ADDRESSES.ethereum.FRAX
    }
];

async function findBalances(contracts, block) {
    const balances = {};

    const balanceOfs = (await sdk.api.abi.multiCall({
        calls: contracts.map((c) => ({
            target: c.token,
            params: c.address
        })),
        abi: "erc20:balanceOf",
        block,
        chain: 'ethereum'
    })).output;
    
    for (let i = 0; i < contracts.length; i++) {
            sdk.util.sumSingleBalance(
                balances, 
                contracts[i].token, 
                balanceOfs[i].output
            );
        
    }
    return balances;
}

async function tvl(timestamp, ethBlock, chainBlocks) {
    return await findBalances(tvlContracts, ethBlock);
}


module.exports = {
    ethereum: {
        tvl,
        
    }
};