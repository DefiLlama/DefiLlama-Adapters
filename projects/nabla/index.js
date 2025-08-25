const { getLogs2 } = require("../helper/cache/getLogs");

const config = {
    arbitrum: {
        router: "0x7bcFc8b8ff61456ad7C5E2be8517D01df006d18d",
        fromBlock: 240797440,
        backstopPool: "0x337B03C2a7482c6eb29d8047eA073119dc68a29A",
    },
    base: {
        router: "0x791Fee7b66ABeF59630943194aF17B029c6F487B",
        fromBlock: 19980311,
        backstopPool: "0x50841f086891fe57829ee0a809f8B10174892b69",
    },
    berachain: {
        router: "0x8756fd992569E0389bF357EB087f5827F364D2a4",
        fromBlock: 4919561,
        backstopPool: "0xfa158Cf7cD83F418eBD1326121810466972447F6",
    },
};

const abis = {
    router: {
        swapPoolRegistrationEvent:
            "event SwapPoolRegistered(address indexed sender, address pool, address asset)",
        poolByAsset:
            "function poolByAsset(address _asset) external view returns (address swapPool_)",
    },
    backstopPool: {
        getBackedPool:
            "function getBackedPool(uint256 _index) external view returns (address swapPool_)",
        getBackedPoolCount:
            "function getBackedPoolCount() external view returns (uint256 count_)",
    },
};

Object.keys(config).forEach((chain) => {
    const { router, fromBlock, backstopPool } = config[chain];

    module.exports[chain] = {
        tvl: async (api) => {
            if (chain == "berachain") {
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

                // Get unique assets of all backed swap pools
                const backedSwapPoolAssets = await api.multiCall({
                    abi: "address:asset",
                    calls: backedSwapPools,
                });
                const uniqueAssets = [...new Set(backedSwapPoolAssets)];

                // Get all "active" swap pools from router that correspond to the unique assets (might return zero address for removed swap pools)
                const activeSwapPools = await api.multiCall({
                    target: router,
                    abi: abis.router.poolByAsset,
                    calls: uniqueAssets,
                });

                // Create tokens and owners for TVL calculation
                const tokensAndOwners = [];

                tokensAndOwners.push([backstopAsset, backstopPool]);

                uniqueAssets.forEach((asset, i) => {
                    const swapPool = activeSwapPools[i];
                    if (
                        swapPool !==
                        "0x0000000000000000000000000000000000000000"
                    ) {
                        tokensAndOwners.push([asset, swapPool]);
                    }
                });

                return api.sumTokens({ tokensAndOwners });
            } else {
                const logs = await getLogs2({
                    api,
                    target: router,
                    eventAbi: abis.router.swapPoolRegistrationEvent,
                    fromBlock,
                });
                const pools = logs.map((log) => log.pool);
                const tokensAndOwners = logs.map((i) => [i.asset, i.pool]);

                let backstops = await api.multiCall({
                    abi: "address:backstop",
                    calls: pools,
                });
                backstops = [...new Set(backstops)];
                const bTokens = await api.multiCall({
                    abi: "address:asset",
                    calls: backstops,
                });
                backstops.forEach((backstop, i) =>
                    tokensAndOwners.push([bTokens[i], backstop])
                );

                return api.sumTokens({ tokensAndOwners });
            }
        },
    };
});
