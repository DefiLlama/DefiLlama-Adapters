
const sdk = require('@defillama/sdk');

const upshiftPoolABI = {
    "totalAssets": "function totalAssets() external view returns (uint256)",
    "asset": "function asset() view returns (address)",
}

const poolAddresses = {
    ethereum: ["0xB7858b66dFA38b9Cb74d00421316116A7851c273", "0x80E1048eDE66ec4c364b4F22C8768fc657FF6A42", "0x18a5a3D575F34e5eBa92ac99B0976dBe26f9F869", "0xEBac5e50003d4B17Be422ff9775043cD61002f7f"],
    avax: ["0x3408b22d8895753C9A3e14e4222E981d4E9A599E"],
    base: ["0x4e2D90f0307A93b54ACA31dc606F93FE6b9132d2"]
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


    underlyingToken.forEach((token, idx) => {
        if (balances[`ethereum:${token}`] === undefined) {
            balances[`ethereum:${token}`] = totalAssets[idx]
        } else {
            balances[`ethereum:${token}`] = (sdk.util.convertToBigInt(balances[`ethereum:${token}`]) + sdk.util.convertToBigInt(totalAssets[idx])).toString()
        }
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

    underlyingToken.forEach((token, idx) => {
        if (balances[`avax:${token}`] === undefined) {
            balances[`avax:${token}`] = totalAssets[idx]
        } else {
            balances[`ethereum:${token}`] = (sdk.util.convertToBigInt(balances[`ethereum:${token}`]) + sdk.util.convertToBigInt(totalAssets[idx])).toString()
        }
    });

    return balances;
}

async function base(api) {
    const balances = {};
    const pools = poolAddresses["base"];
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

    underlyingToken.forEach((token, idx) => {
        if (balances[`base:${token}`] === undefined) {
            balances[`base:${token}`] = totalAssets[idx]
        } else {
            balances[`ethereum:${token}`] = (sdk.util.convertToBigInt(balances[`ethereum:${token}`]) + sdk.util.convertToBigInt(totalAssets[idx])).toString()
        }
    });

    return balances;
}

module.exports = {
    methodology: "TVL is the sum of totalAssets for each erc4626 vault, meaning the sum of user deposits in all vaults.",
    ethereum: {
        tvl: eth
    },
    avax: {
        tvl: avax
    },
    base: {
        tvl: base
    }
}