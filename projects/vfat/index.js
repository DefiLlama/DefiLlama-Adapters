const { getLogs } = require('../helper/cache/getLogs');
const sdk = require('@defillama/sdk');

// Chain settings
const chainSettings = {
    base: {
        factory: '0x71D234A3e1dfC161cc1d081E6496e76627baAc31',
        gaugeFactory: '0x35f35cA5B132CaDf2916BaB57639128eAC5bbcb5',
        gaugeFactory2: '0xD30677bd8dd15132F251Cb54CbDA552d2A05Fb08',
        voter: '0x16613524e02ad97edfef371bc883f2f5d6c480a5',
        NonfungiblePositionManager: '0x827922686190790b37229fd06084350E74485b72',
        fromBlock: 3200567,
        fromBlockSickle: 12116234,
        chainName: 'base',
    },
    optimism: {
        factory: '0xB4C31b0f0B76b351395D4aCC94A54dD4e6fbA1E8',
        gaugeFactory: '0x8391fE399640E7228A059f8Fa104b8a7B4835071',
        gaugeFactory2: '0x282AC0eA96493650F1A5E5e5d20490C782F1592a',
        voter: '0x41C914ee0c7E1A5edCD0295623e6dC557B5aBf3C',
        NonfungiblePositionManager: '0xbB5DFE1380333CEE4c2EeBd7202c80dE2256AdF4',
        fromBlock: 105896812,
        fromBlockSickle: 117753454,
        chainName: 'optimism',
    },
};

// Utility function to calculate the square root price from a tick value
function calculateSqrtPriceFromTick(tick) {
    return Math.sqrt(Math.pow(1.0001, tick));
}

// TVL calculation function that accepts a chain configuration as a parameter
async function tvl(chainConfig, api) {
    const { factory, gaugeFactory, gaugeFactory2, voter, NonfungiblePositionManager, fromBlock, fromBlockSickle, chainName } = chainConfig;

    // Fetch logs from both the factory and the voter contracts
    const [deployLogs, deployAeroLogs] = await Promise.all([
        getLogs({
            api,
            target: factory,
            topic: 'Deploy(address,address)',
            fromBlock: fromBlockSickle,
            eventAbi: 'event Deploy(address indexed admin, address sickle)',
        }),
        getLogs({
            api,
            target: voter,
            topic: 'GaugeCreated(address,address,address,address,address,address,address,address)',
            fromBlock,
            eventAbi: `event GaugeCreated(
                address indexed poolFactory,
                address indexed votingRewardsFactory,
                address indexed gaugeFactory,
                address pool,
                address bribeVotingReward,
                address feeVotingReward,
                address gauge,
                address creator
            )`,
        }),
    ]);

    // Get the addresses of deployed sickles
    const sickles = deployLogs.map(log => log.args[1]);

    // Separate gauges by type
    const deployedAeroGauges = deployAeroLogs.reduce(
        (acc, log) => {
            const gaugeFactoryAddress = log.args[2];
            const gaugeAddress = log.args[6];
            if (gaugeFactoryAddress === gaugeFactory) {
                acc.lp.push(gaugeAddress);
            } else if (gaugeFactoryAddress === gaugeFactory2) {
                acc.nft.push(gaugeAddress);
            }
            return acc;
        },
        { lp: [], nft: [] }
    );

    // Prepare balance queries for each gauge-sickle pair
    const balanceCallsLP = [];
    const stakingTokenCalls = [];

    for (const gauge of [...deployedAeroGauges.lp]) {
        for (const sickle of sickles) {
            balanceCallsLP.push({ target: gauge, params: [sickle] });
            stakingTokenCalls.push({ target: gauge });
        }
    }

    // Execute the balanceOf and stakingToken queries
    const [resultsWithBalanceLP, stakingTokens] = await Promise.all([
        sdk.api.abi.multiCall({
            abi: 'erc20:balanceOf',
            calls: balanceCallsLP,
            chain: chainName,
        }),
        sdk.api.abi.multiCall({
            abi: 'function stakingToken() view returns (address)',
            calls: stakingTokenCalls,
            chain: chainName,
        }),
    ]);

    // Process balances from LP gauges
    const balances = {};
    resultsWithBalanceLP.output.forEach((balanceResult, index) => {
        const balance = balanceResult.output;
        const stakingTokenAddress = stakingTokens.output[index].output;
        sdk.util.sumSingleBalance(balances, stakingTokenAddress, balance, chainName);
    });

    // Handle NFT gauges similarly
    const balanceCallsNFT = [];
    for (const gauge of [...deployedAeroGauges.nft]) {
        for (const sickle of sickles) {
            balanceCallsNFT.push({ target: gauge, params: [sickle] });
        }
    }

    // Fetch the staked values from NFT gauges
    const nftResults = await sdk.api.abi.multiCall({
        abi: 'function stakedValues(address depositor) view returns (uint256[])',
        calls: balanceCallsNFT,
        chain: chainName,
    });

    // Organize results for further processing
    const structuredResults = {};
    nftResults.output.forEach((result, index) => {
        const gauge = balanceCallsNFT[index].target;
        const nftOutput = result.output;

        if (!structuredResults[gauge]) {
            structuredResults[gauge] = { nftIds: [] };
        }

        if (Array.isArray(nftOutput) && nftOutput.length > 0) {
            nftOutput.forEach(id => {
                structuredResults[gauge].nftIds.push({ id });
            });
        }
    });

    // Retrieve additional data for each gauge and NFT position
    for (const [gauge, gaugeData] of Object.entries(structuredResults)) {
        const positionCalls = gaugeData.nftIds.map(nftIdObj => ({
            target: NonfungiblePositionManager,
            params: [nftIdObj.id],
        }));

        const positionsResults = await sdk.api.abi.multiCall({
            abi: 'function positions(uint256 tokenId) view returns (uint96 nonce, address operator, address token0, address token1, int24 tickSpacing, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)',
            calls: positionCalls,
            chain: chainName,
        });

        structuredResults[gauge].positions = {};
        positionsResults.output.forEach(result => {
            const nftId = result.input.params[0];
            structuredResults[gauge].positions[nftId] = result.output;
        });
    }

    // Fetch pool addresses and their tick data
    const poolCalls = Object.keys(structuredResults).map(gauge => ({
        target: gauge,
    }));

    const poolResults = await sdk.api.abi.multiCall({
        abi: 'function pool() view returns (address)',
        calls: poolCalls,
        chain: chainName,
    });

    poolResults.output.forEach((result, index) => {
        const gaugeAddress = poolCalls[index].target;
        structuredResults[gaugeAddress].pool = result.output;
    });

    const slot0Calls = [];
    Object.entries(structuredResults).forEach(([gaugeAddress, data]) => {
        if (data.pool) {
            slot0Calls.push({
                target: data.pool,
            });
        }
    });

    const slot0Results = await sdk.api.abi.multiCall({
        abi: 'function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, bool unlocked)',
        calls: slot0Calls,
        chain: chainName,
    });

    slot0Results.output.forEach((result, index) => {
        const poolAddress = slot0Calls[index].target;
        for (const gaugeAddress in structuredResults) {
            if (structuredResults[gaugeAddress].pool === poolAddress) {
                structuredResults[gaugeAddress].poolTick = result.output.tick;
                break;
            }
        }
    });

    Object.entries(structuredResults).forEach(([gaugeAddress, gaugeData]) => {
        const currentTick = parseInt(gaugeData.poolTick);
        const sqrtPriceCurrent = calculateSqrtPriceFromTick(currentTick);

        Object.entries(gaugeData.positions).forEach(([tokenId, position]) => {
            const liquidity = parseInt(position[7]);
            const sqrtPriceLower = calculateSqrtPriceFromTick(parseInt(position[5]));
            const sqrtPriceUpper = calculateSqrtPriceFromTick(parseInt(position[6]));

            const liquidityAmount0 = (liquidity * (sqrtPriceUpper - sqrtPriceCurrent)) / (sqrtPriceUpper * sqrtPriceCurrent);
            const liquidityAmount1 = liquidity * (sqrtPriceCurrent - sqrtPriceLower);

            sdk.util.sumSingleBalance(balances, position[2], liquidityAmount0, chainName);
            sdk.util.sumSingleBalance(balances, position[3], liquidityAmount1, chainName);
        });
    });

    return balances;
}

// Export the `tvl` function bound to each chain configuration
module.exports = {
    base: {
        tvl: tvl.bind(null, chainSettings.base),
    },
    optimism: {
        tvl: tvl.bind(null, chainSettings.optimism),
    },
};
