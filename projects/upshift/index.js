
const sdk = require('@defillama/sdk');

const upshiftPoolABI = {
    "totalAssets": "function totalAssets() external view returns (uint256)",
    "asset": "function asset() view returns (address)",
}

const poolAddresses = {
    ethereum: ["0xB7858b66dFA38b9Cb74d00421316116A7851c273", "0x80E1048eDE66ec4c364b4F22C8768fc657FF6A42"],
    avax: ["0x3408b22d8895753C9A3e14e4222E981d4E9A599E"]
}

async function eth(api) {
    const balances = {};
    const pools = poolAddresses["ethereum"];
    const totalAssets = await api.multiCall({
        calls: pools.map(token => ({
            target: token,
        })),
        abi: upshiftPoolABI.totalAssets
    });

    const underlyingToken = await api.multiCall({
        calls: pools.map(token => ({
            target: token,
        })),
        abi: upshiftPoolABI.asset
    });


    pools.forEach((_token, idx) => {
        balances[`ethereum:${underlyingToken[idx]}`] = totalAssets[idx]
    });

    return balances;
}

async function avax(api) {
    const balances = {};
    const pools = poolAddresses["avax"];
    const totalAssets = await api.multiCall({
        calls: pools.map(token => ({
            target: token,
        })),
        abi: upshiftPoolABI.totalAssets
    });


    const underlyingToken = await api.multiCall({
        calls: pools.map(token => ({
            target: token,
        })),
        abi: upshiftPoolABI.asset
    });

    pools.forEach((_token, idx) => {
        balances[`avax:${underlyingToken[idx]}`] = totalAssets[idx]
    });

    return balances;
}

module.exports = {
    methodology: "TVL is calculated by summing the total assets of all pools",
    ethereum: {
        tvl: eth
    },
    avax: {
        tvl: avax
    }
}