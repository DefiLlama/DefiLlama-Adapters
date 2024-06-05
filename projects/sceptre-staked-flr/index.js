const ADDRESSES = require('../helper/coreAssets.json');
const sdk = require('@defillama/sdk');
const sflrAbi = require("./sflr.json");

const SFLR = "0x12e605bc104e93B45e1aD99F9e555f659051c2BB";

async function tvl(timestamp, block, chainBlocks) {
    const pooledFlr = await sdk.api.abi.call({
        target: SFLR,
        abi: sflrAbi.totalPooledFlr,
        chain: "flare",
        block: chainBlocks.flare,
    });

    const balances = {};
    const pooledFlrBalance = pooledFlr.output;

    balances[`flare:${SFLR}`] = pooledFlrBalance;

    return balances;
}

module.exports = {
    flare: {
        tvl,
    },
    methodology: "Counts staked FLR tokens.",
};
