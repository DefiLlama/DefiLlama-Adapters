const sdk = require('@defillama/sdk');
const marketsJSON = require('./market.json');
const abi = require('./abi.json');
const { unwrapCrv, unwrapYearn } = require('../helper/unwrapLPs')
const { transformAvaxAddress, transformArbitrumAddress, transformFantomAddress 
    } = require("../helper/portedTokens");
const { getBlock } = require('../helper/getBlock');

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
async function transformEthAddress() {
    return (addr) => {
        switch(addr.toLowerCase()) {
            case '0xca76543cf381ebbb277be79574059e32108e3e65':
                return '0x383518188c0c6d7730d91b2c03a03c837814a899';
            default:
                return addr;
        };
    };
};
async function ethTvl(timestamp, ethBlock, chainBlocks) {
    return tvl(timestamp, chainBlocks, 'ethereum', (await transformEthAddress()));
};
async function ftmTvl(timestamp, ethBlock, chainBlocks) {
    return tvl(timestamp, chainBlocks, 'fantom', (await transformFantomAddress()));
};
async function arbiTvl(timestamp, ethBlock, chainBlocks) {
    return tvl(timestamp, chainBlocks, 'arbitrum', (await transformArbitrumAddress()));
};
async function avaxTvl(timestamp, ethBlock, chainBlocks) {
    return tvl(timestamp, chainBlocks, 'avax', (await transformAvaxAddress()));
};
async function tvl(timestamp, chainBlocks, chain, transformAddress=addr=>addr) {
    let marketsArray = [];
    let balances = {};
    let block;

    for (const [marketContract, lockedToken] of Object.entries(marketsJSON[chain])) {
        marketsArray.push([lockedToken, marketContract]);
    };

    if (chainBlocks[chain]) {
        block = chainBlocks[chain];
    } else {
        block = await getBlock(timestamp, chain, chainBlocks);
    };

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
        await unwrapYearn(balances, marketsArray[index][0], block, chain, transformAddress);
      };
    for (let [token, balance] of Object.entries(balances)) {
        await unwrapCrv(balances, token, balance, block, chain, transformAddress);
    };
    if ('0x383518188c0c6d7730d91b2c03a03c837814a899' in balances) {
        balances['0x383518188c0c6d7730d91b2c03a03c837814a899'] = 
            balances['0x383518188c0c6d7730d91b2c03a03c837814a899'] / 10**9;
    };
    return balances;
};
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
    tvl: sdk.util.sumChainTvls([ethTvl, arbiTvl, avaxTvl, ftmTvl]),
}