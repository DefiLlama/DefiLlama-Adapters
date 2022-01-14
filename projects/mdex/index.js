const retry = require('async-retry');
const axios = require("axios");
const sdk = require("@defillama/sdk");
const { getBlock } = require("../helper/getBlock");
const { transformBscAddress, transformHecoAddress } = require("../helper/portedTokens");

async function tvl(block, chain, chainId, transform = a => a) {
    const balances = {};

    const response = (await retry(async () => 
        await axios.get(`https://info.mdex.one/pair/all?chain_id=${chainId}`)
    )).data.result;
    
    const pools = response.map(p => ({
        address: p.address,
        token0: p.token0_address,
        token1: p.token1_address
    }));

    const [ token0Balances, token1Balances ] = await Promise.all([
        sdk.api.abi.multiCall({
            calls: pools.map((p) => ({
                target: p.token0,
                params: p.address
            })),
            abi: "erc20:balanceOf",
            block,
            chain
        }),
        sdk.api.abi.multiCall({
            calls: pools.map((p,) => ({
                target: p.token1,
                params: p.address
            })),
            abi: "erc20:balanceOf",
            block,
            chain
        })
    ]);
    await Promise.all([
        sdk.util.sumMultiBalanceOf(balances, token0Balances, false, transform),
        sdk.util.sumMultiBalanceOf(balances, token1Balances, false, transform)
    ]);

    return balances;
}; 

// node test.js projects/mdex/index.js
async function heco(timestamp, block, chainBlocks) { 
    const transform = await transformHecoAddress();
    block = getBlock(timestamp, 'heco', chainBlocks);
    return await tvl(block, 'heco', 128, transform);
};
async function bsc(timestamp, block, chainBlocks) { 
    const transform = await transformBscAddress();
    block = getBlock(timestamp, 'bsc', chainBlocks);
    return await tvl(block, 'bsc', 56, transform);
};
module.exports = {
    timetravel: false,
    heco: {
        tvl: heco
    },
    bsc: {
        tvl: bsc
    }
};
