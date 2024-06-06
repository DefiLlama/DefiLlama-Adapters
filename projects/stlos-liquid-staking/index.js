const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const sTlosAbi = require("./sTlos.json");

const sTLOS = ADDRESSES.telos.STLOS;

async function tvl(timestamp, _, { telos: block }) {
    const pooledTLOS = await sdk.api.abi.call({
        target: sTLOS,
        abi: sTlosAbi.totalAssets,
        chain: "telos", block,
    });

    return {
        telos: pooledTLOS.output / 1e18
    };
}

module.exports = {
    telos: {
        tvl,
    },
    methodology: "Counts staked TLOS tokens in sTLOS contract.",
}