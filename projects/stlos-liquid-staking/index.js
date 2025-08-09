const ADDRESSES = require('../helper/coreAssets.json')

const sTLOS = ADDRESSES.telos.STLOS;

async function tvl(api) {
    const pooledTLOS = await api.call({ target: sTLOS, abi: "uint256:totalAssets", });
    return { telos: pooledTLOS / 1e18 };
}

module.exports = {
    telos: {
        tvl,
    },
    methodology: "Counts staked TLOS tokens in sTLOS contract.",
}