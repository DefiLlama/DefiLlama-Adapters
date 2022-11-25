const axios = require('axios');
const sdk = require("@defillama/sdk");

const poolsUrl = 'https://api.lympo.io/pools/poolsV2/pools.json';
const sportTokenAddress = "0x503836c8c3A453c57f58CC99B070F2E78Ec14fC0"

async function getBalances(pools, block) {

    const balances = {};

    for(pool of pools) {
        const balanceResponse = await sdk.api.abi.call({
            target: sportTokenAddress,
            abi: "erc20:balanceOf",
            params: pool.address,
            chain: "polygon"
        })

        sdk.util.sumSingleBalance(balances, sportTokenAddress, balanceResponse.output);

        balances[sportTokenAddress] = balanceResponse.output;
    }

    return balances
}

async function tvl(timestamp, block) {
    const pools = (await axios.get(poolsUrl)).data;
    const balances = await getBalances(pools, block);

    return {
        "sport": balances[sportTokenAddress] / 1e18
    };
}

module.exports = {
    polygon: {
        tvl
    }
}