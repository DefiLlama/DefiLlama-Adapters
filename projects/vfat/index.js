const { getLogs } = require('../helper/cache/getLogs');
const sdk = require('@defillama/sdk');

function calculateSqrtPriceFromTick(tick) {
    return Math.sqrt(Math.pow(1.0001, tick));
}

async function tvl(api) {
    const factory = '0x71D234A3e1dfC161cc1d081E6496e76627baAc31';
    const gaugeFactory = '0x35f35cA5B132CaDf2916BaB57639128eAC5bbcb5';
    const gaugeFactory2 = '0xD30677bd8dd15132F251Cb54CbDA552d2A05Fb08';
    const voter = '0x16613524e02ad97edfef371bc883f2f5d6c480a5';
    const NonfungiblePositionManager = '0x827922686190790b37229fd06084350E74485b72';
    const fromBlock = 3200567;
    const fromBlockSickle = 12116234;

    // Fetch logs from the two factories
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
    const balanceCallsNFT = [];
    const stakingTokenCalls = [];

    for (const gauge of [...deployedAeroGauges.lp]) {
        for (const sickle of sickles) {

            balanceCallsLP.push({ target: gauge, params: [sickle] });

            stakingTokenCalls.push({ target: gauge });
        }
    }

    // Execute the balanceOf, stakedValues, and stakingToken queries
    const [resultsWithBalanceLP, stakingTokens] = await Promise.all([
        sdk.api.abi.multiCall({
            abi: 'erc20:balanceOf',
            calls: balanceCallsLP,
            chain: 'base'
        }),
        sdk.api.abi.multiCall({
            abi: 'function stakingToken() view returns (address)',
            calls: stakingTokenCalls,
            chain: 'base'
        })
    ]);


    for (const gauge of [...deployedAeroGauges.nft]) {
        for (const sickle of sickles) {
            balanceCallsNFT.push({ target: gauge, params: [sickle] });
        }
    }

    // Call to fetch the staked values
    const nftResults = await sdk.api.abi.multiCall({
        abi: 'function stakedValues(address depositor) view returns (uint256[])',
        calls: balanceCallsNFT,
        chain: 'base'
    }).catch(error => {
        console.error("API call failed:", error);
        return { output: [] }; // Return empty output in case of failure
    });

    // Initialize the structured results object
    const structuredResults = {};

    // Loop through the results to build a structured response
    for (let i = 0; i < nftResults.output.length; i++) {
        const gauge = balanceCallsNFT[i].target;
        const nftOutput = nftResults.output[i].output;

        // Ensure that each gauge address has an entry, initialize if not present
        if (!structuredResults[gauge]) {
            structuredResults[gauge] = { nftIds: [] };
        }

        // Check if the nftOutput is an array and not empty
        if (Array.isArray(nftOutput) && nftOutput.length > 0) {
            // Extend the existing array of NFT IDs under the gauge address
            nftOutput.forEach(id => {
                structuredResults[gauge].nftIds.push({ id });
            });
        }
    }

    // Iterate through each gauge and its NFT IDs
    for (const [gauge, gaugeData] of Object.entries(structuredResults)) {

        // Prepare calls for each NFT ID within the gauge
        const positionCalls = gaugeData.nftIds.map(nftIdObj => ({
            target: NonfungiblePositionManager,
            params: [nftIdObj.id] // Extract the numeric ID from the object
        }));

        // Execute multicall for this gauge's NFT IDs
        const positionsResults = await sdk.api.abi.multiCall({
            abi: 'function positions(uint256 tokenId) view returns (uint96 nonce, address operator, address token0, address token1, int24 tickSpacing, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)',
            calls: positionCalls,
            chain: 'base'
        });

        // Update the structuredResults with position data for this gauge
        structuredResults[gauge].positions = {}; // Add a "positions" property
        positionsResults.output.forEach(result => {
            const nftId = result.input.params[0];
            structuredResults[gauge].positions[nftId] = result.output;
        });
    }

    const filteredResults = {};

    for (const [gauge, gaugeData] of Object.entries(structuredResults)) {
        if (gaugeData.nftIds.length > 0) {
            filteredResults[gauge] = gaugeData;
        }
    }

    // Prepare Calls for `pool` Method
    const poolCalls = Object.keys(filteredResults).map(gauge => ({
        target: gauge,
        call: { target: gauge, params: [] }
    }));

    // Execute MultiCall to Fetch `pool` Addresses
    const poolResults = await sdk.api.abi.multiCall({
        abi: 'function pool() view returns (address)',
        calls: poolCalls,
        chain: 'base'
    }).catch(error => {
        console.error("API call failed:", error);
        return { output: [] }; // Return empty output in case of failure
    });

    // Integrate `pool` Addresses into Your Results
    poolResults.output.forEach((result, index) => {
        const gaugeAddress = poolCalls[index].target;
        // Add the pool address to the corresponding gauge entry in filteredResults
        filteredResults[gaugeAddress].pool = result.output;
    });

    // Prepare calls for `slot0` method for each pool
    let slot0Calls = [];
    Object.entries(filteredResults).forEach(([gaugeAddress, data]) => {
        if (data.pool) {
            slot0Calls.push({
                target: data.pool,
                call: { target: data.pool, params: [] } // slot0 doesn't take parameters
            });
        }
    });

    // Execute multiCall to fetch poolTicks
    const slot0Results = await sdk.api.abi.multiCall({
        abi: 'function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, bool unlocked)',
        calls: slot0Calls,
        chain: 'base'
    }).catch(error => {
        console.error("API call failed:", error);
        return { output: [] }; // Return empty output in case of failure
    });

    // Integrate poolTicks into filteredResults
    slot0Results.output.forEach((result, index) => {
        const poolAddress = slot0Calls[index].target;
        // Find which gauge this pool belongs to
        for (const gaugeAddress in filteredResults) {
            if (filteredResults[gaugeAddress].pool === poolAddress) {
                if (result.success) {
                    filteredResults[gaugeAddress].poolTick = result.output.tick;
                } else {
                    filteredResults[gaugeAddress].poolTick = "Error fetching pool tick";
                }
                break;
            }
        }
    });


    // Combine results and sum the balances
    const balances = {};

    resultsWithBalanceLP.output.forEach((balanceResult, index) => {
        const balance = balanceResult.output;
        const stakingTokenAddress = stakingTokens.output[index].output;
        sdk.util.sumSingleBalance(balances, stakingTokenAddress, balance, 'base');
    });

    Object.entries(structuredResults).forEach(([gaugeAddress, gaugeData]) => {
        // Get pool tick and calculate square root price
        const currentTick = parseInt(gaugeData.poolTick);
        const sqrtPriceCurrent = calculateSqrtPriceFromTick(currentTick);

        // Process each position within the gauge
        Object.entries(gaugeData.positions).forEach(([tokenId, position]) => {
            const liquidity = parseInt(position[7]); // position.liquidity
            const sqrtPriceLower = calculateSqrtPriceFromTick(parseInt(position[5])); // tickLower
            const sqrtPriceUpper = calculateSqrtPriceFromTick(parseInt(position[6])); // tickUpper

            // Calculate balances for token0 and token1
            const liquidityAmount0 = (liquidity * (sqrtPriceUpper - sqrtPriceCurrent)) / (sqrtPriceUpper * sqrtPriceCurrent);
            const liquidityAmount1 = liquidity * (sqrtPriceCurrent - sqrtPriceLower);

            // Token addresses
            const token0Address = position[2];
            const token1Address = position[3];

            // Sum balances
            if (!balances[token0Address]) balances[token0Address] = 0;
            if (!balances[token1Address]) balances[token1Address] = 0;

            balances[token0Address] += liquidityAmount0;
            balances[token1Address] += liquidityAmount1;
            sdk.util.sumSingleBalance(balances, token0Address, liquidityAmount0, 'base');
            sdk.util.sumSingleBalance(balances, token1Address, liquidityAmount1, 'base');
        });
    });

    return balances;
}

module.exports = {
    base: {
        tvl,
    },
};
