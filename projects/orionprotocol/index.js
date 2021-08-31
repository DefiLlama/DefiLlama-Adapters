const sdk = require("@defillama/sdk");
const tvlOnPairs = require("../helper/processPairs.js");

const ethFactory = "0x5FA0060FcfEa35B31F7A5f6025F0fF399b98Edf1";
const bscFactory = "0xE52cCf7B6cE4817449F2E6fA7efD7B567803E4b4";

const ethTvl = async (timestamp, ethBlock, chainBlocks) => {
    const balances = {};

    await tvlOnPairs("ethereum", chainBlocks, ethFactory, balances);

    return balances;
};

const bscTvl = async (timestamp, ethBlock, chainBlocks) => {
    const balances = {};

    await tvlOnPairs("bsc", chainBlocks, bscFactory, balances);

    return balances;
};

module.exports = {
    ethereum: {
        tvl: ethTvl,
    },
    bsc: {
        tvl: bscTvl,
    },
    tvl: sdk.util.sumChainTvls([ethTvl, bscTvl]),
};
