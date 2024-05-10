const { getLogs } = require('../helper/cache/getLogs');
const sdk = require('@defillama/sdk');

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

    const nftResults = await sdk.api.abi.multiCall({
        abi: 'function stakedValues(address depositor) view returns (uint256[])',
        calls: balanceCallsNFT,
        chain: 'base'
    });

    // flatten output
    const nftIds = nftResults.output.map(result => result.output).flat();


    // Prepare calls for each NFT ID to get positions
    const positionCalls = nftIds.map(nftId => ({
        target: NonfungiblePositionManager,
        params: [nftId]
    }));

    // Execute multicall to get positions for each NFT
    const positionsResults = await sdk.api.abi.multiCall({
        abi: 'function positions(uint256 tokenId) view returns (uint96 nonce, address operator, address token0, address token1, int24 tickSpacing, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)',
        calls: positionCalls,
        chain: 'base'
    });

    // Initialize an object to store results
    const formattedResults = {};

    // Populate the object with NFT IDs as keys and their corresponding multicall results as values
    positionsResults.output.forEach(result => {
        const nftId = result.input.params[0];
        if (result.success) {
            formattedResults[nftId] = result.output;
        } else {
            formattedResults[nftId] = { error: 'Failed to fetch details' };
        }
    });

    console.log(formattedResults);


    // Combine results and sum the balances
    const balances = {};

    resultsWithBalanceLP.output.forEach((balanceResult, index) => {
        const balance = balanceResult.output;
        const stakingTokenAddress = stakingTokens.output[index].output;
        sdk.util.sumSingleBalance(balances, stakingTokenAddress, balance, 'base');
    });

    return balances;
}

module.exports = {
    base: {
        tvl,
    },
};
