const utils = require('./helper/utils');
const sdk = require("@defillama/sdk");

async function tvl(timestamp, block, chainBlocks) {
    const balances = {};

    const response = await utils.fetchURL(`https://raw.githubusercontent.com/LATOKEN/farm-list/main/latoken.farmlist.json`);

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
        
        const oracleId = f.oracleId;
        var rate = 0;

        if(f.oracle == 'lps'){
            const lp_rate = await utils.fetchURL(`https://api.beefy.finance/lps`).data;
            // rate = lp_rate[oracleId]
            // console.log("lp_rate: ", lp_rate);
        }
        else if(f.oracle == 'tokens'){
            const token_rate = await utils.fetchURL(`https://api.beefy.finance/prices`).data;
            // console.log("token_rate: ", token_rate);
            
            rate = token_rate[token_rate]
            console.log("Avax:: ", token_rate.AVAX);
        }
        console.log("oracleId: ", oracleId);
        console.log("rate: ", rate);
        
    };

    return balances;
};

module.exports = {
    lachain: {
        tvl
    }
};