const sdk = require("@defillama/sdk");
const sTlosAbi = require("./sTlos.json");

const sTLOS = "0xb4b01216a5bc8f1c8a33cd990a1239030e60c905";

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