const sdk = require('@defillama/sdk');
const marketsJSON = require('./market.json');
const abi = require('./abi.json');

// --------------------------
// cvx3pool & yvcrvIB tokens
// are not being unwrapped
// on eth (~$169M tvl)
// --------------------------
const bentoBoxAddresses = {
    "ethereum": "0xF5BCE5077908a1b7370B9ae04AdC565EBd643966",
    "arbitrum": "0x74c764D41B77DBbb4fe771daB1939B00b146894A",
    "avax": "0xf4F46382C2bE1603Dc817551Ff9A7b333Ed1D18f",
    "fantom": "0xF5BCE5077908a1b7370B9ae04AdC565EBd643966"
};
async function ethTvl(timestamp, ethBlock, chainBlocks) {
    return tvl(timestamp, chainBlocks, 'ethereum', addr => 'ethereum:'+addr);
}
async function ftmTvl(timestamp, ethBlock, chainBlocks) {
    return tvl(timestamp, chainBlocks, 'fantom', addr => 'fantom:'+addr);
}
async function arbiTvl(timestamp, ethBlock, chainBlocks) {
    return tvl(timestamp, chainBlocks, 'arbitrum', addr => 'arbitrum:'+addr);
}
async function avaxTvl(timestamp, ethBlock, chainBlocks) {
    return tvl(timestamp, chainBlocks, 'avax', addr => 'avax:'+addr);
}
async function tvl(timestamp, chainBlocks, chain, transformAddress=addr=>addr) {
    let marketsArray = [];
    let balances = {};
    let block;

    for (const [marketContract, lockedToken] of Object.entries(marketsJSON[chain])) {
        marketsArray.push([lockedToken, marketContract]);
    }

    block = chainBlocks[chain];

    let tokenBalances = (await sdk.api.abi.multiCall({
        block: block,
        calls: marketsArray.map((market) => ({
            target: bentoBoxAddresses[chain],
            params: market
        })),
        abi: abi.balanceOf,
        chain: chain
    })).output.map(t => t.output);

    for (let index = 0; index < marketsArray.length; index++) {
        sdk.util.sumSingleBalance(
          balances,
          transformAddress(marketsArray[index][0]),
          tokenBalances[index]
        );
      }
    
    return balances;
}
module.exports = {
    ethereum: {
        tvl: ethTvl
    },
    arbitrum: {
        tvl: arbiTvl
    },
    avax: {
        tvl: avaxTvl
    },
    fantom: {
        tvl: ftmTvl
    },
}