const sdk = require('@defillama/sdk');
const marketsJSON = require('./market.json');
const abi = require('./abi.json');

// --------------------------
// cvx3pool & yvcrvIB tokens
// are not being unwrapped
// on eth (~$169M tvl)
// --------------------------
const bentoBoxAddresses = {
    "arbitrum": ["0x74c764D41B77DBbb4fe771daB1939B00b146894A", "0x7c8fef8ea9b1fe46a7689bfb8149341c90431d38"],
    "avax": ["0xf4F46382C2bE1603Dc817551Ff9A7b333Ed1D18f", "0x1fC83f75499b7620d53757f0b01E2ae626aAE530"],
    "bsc": ["0x090185f2135308BaD17527004364eBcC2D37e5F6"],
    "ethereum": ["0xF5BCE5077908a1b7370B9ae04AdC565EBd643966", "0xd96f48665a1410C0cd669A88898ecA36B9Fc2cce"],
    "fantom": ["0xF5BCE5077908a1b7370B9ae04AdC565EBd643966", "0x74A0BcA2eeEdf8883cb91E37e9ff49430f20a616"],
    "kava": ["0x630fc1758de85c566bdec1d75a894794e1819d7e"],
    "optimism": ["0xa93c81f564579381116ee3e007c9fcfd2eba1723"],
};

function chainTvl(chain, chainAddressIdentifier = chain) {
    return (timestamp, ethBlock, chainBlocks) =>
        tvl(timestamp, chainBlocks, chain, addr => `${chainAddressIdentifier}:${addr}`);
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
        calls: bentoBoxAddresses[chain].map(bentoBoxAddress=> marketsArray.map((market) => ({
            target: bentoBoxAddress,
            params: market
        }))).flat(),
        abi: abi.balanceOf,
        chain: chain
    })).output.map(t => t.output);

    for (let index = 0; index < bentoBoxAddresses[chain].length * marketsArray.length; ++index) {
        const marketIndex = index % marketsArray.length;
        sdk.util.sumSingleBalance(
          balances,
          transformAddress(marketsArray[marketIndex][0]),
          tokenBalances[index]
        );
    }
    
    return balances;
}
module.exports = {
    arbitrum: {
        tvl: chainTvl('arbitrum')
    },
    avax: {
        tvl: chainTvl('avax')
    },
    bsc: {
        tvl: chainTvl('bsc')
    },
    ethereum: {
        tvl: chainTvl('ethereum')
    },
    fantom: {
        tvl: chainTvl('fantom')
    },
    kava: {
        tvl: chainTvl('kava')
    },
    optimism:{
        tvl: chainTvl('optimism')
    }
}