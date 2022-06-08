const utils = require('./helper/utils');
const sdk = require("@defillama/sdk");

async function tvl(timestamp, block, chainBlocks) {
    const response = await utils.fetchURL(`https://raw.githubusercontent.com/LATOKEN/farm-list/main/latoken.farmlist.json`);
    const address_usdt = "0xdac17f958d2ee523a2206206994597c13d831ec7";
    var tvl_sum = 0;

    for (let i = 0; i < response.data.farms.length; i++) {
        const f = response.data.farms[i];

        const supplies = (await sdk.api.abi.call({
            abi: "erc20:totalSupply",
            target: f.wrappedTokenAddress,
            params: [],
            block: chainBlocks.lachain,
            chain: 'lachain'
        })
        ).output;
        
        const decimals = (await sdk.api.abi.call({
            abi: "erc20:decimals",
            target: f.wrappedTokenAddress,
            params: [],
            block: chainBlocks.lachain,
            chain: 'lachain'
        })).output;

        const oracleId = f.oracleId;
        var rate = 0;
        
        if(f.oracle == 'lps'){
            const lp_rate = await utils.fetchURL(`https://api.beefy.finance/lps`);
            rate = lp_rate.data[oracleId]
        }
        else if(f.oracle == 'tokens'){
            const token_rate = await utils.fetchURL(`https://api.beefy.finance/prices`);
            rate = token_rate.data[oracleId]
        }

        tvl_sum += (supplies/10**decimals)*rate;
        
    };
    
    return {[address_usdt]: tvl_sum * 10**6};
};

module.exports = {
    lachain: {
        tvl
    }
};