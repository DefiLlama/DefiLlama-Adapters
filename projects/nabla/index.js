const config = {
    arbitrum: {
        backstopPool: "0x337B03C2a7482c6eb29d8047eA073119dc68a29A",
    },
    base: {
        backstopPool: "0x50841f086891fe57829ee0a809f8B10174892b69",
    },
    berachain: {
        backstopPool: "0xfa158Cf7cD83F418eBD1326121810466972447F6",
    },
};

const abis = {
    backstopPool: {
        getBackedPool:
            "function getBackedPool(uint256 _index) external view returns (address swapPool_)",
        getBackedPoolCount:
            "function getBackedPoolCount() external view returns (uint256 count_)",
    },
};

Object.keys(config).forEach((chain) => {
    const { backstopPool } = config[chain];

    module.exports[chain] = {
        tvl: async (api) => {
            // Get the asset of the backstop pool
            const backstopAsset = await api.call({
                target: backstopPool,
                abi: "address:asset",
            });

            // Get all swap pools backed by the backstop pool
            const backedPoolCount = await api.call({
                target: backstopPool,
                abi: abis.backstopPool.getBackedPoolCount,
            });
            const backedSwapPools = await api.multiCall({
                target: backstopPool,
                abi: abis.backstopPool.getBackedPool,
                calls: [...Array(Number(backedPoolCount)).keys()],
            });

            // Get the assets of all backed swap pools
            const backedSwapPoolAssets = await api.multiCall({
                abi: "address:asset",
                calls: backedSwapPools,
            });

            // Create 'tokens and owners' for TVL calculation
            const tokensAndOwners = [[backstopAsset, backstopPool]];

            backedSwapPools.forEach((swapPool, i) => {
                const swapPoolAsset = backedSwapPoolAssets[i];
                tokensAndOwners.push([swapPoolAsset, swapPool]);
            });

            return api.sumTokens({ tokensAndOwners });
        },
    };
});
