const { getLogs } = require('../helper/cache/getLogs');
const sdk = require('@defillama/sdk');

async function tvl(api) {
    const factory = '0x71D234A3e1dfC161cc1d081E6496e76627baAc31';
    const gaugeFactory = '0x35f35cA5B132CaDf2916BaB57639128eAC5bbcb5';
    const gaugeFactory2 = '0xD30677bd8dd15132F251Cb54CbDA552d2A05Fb08';
    const voter = '0x16613524e02ad97edfef371bc883f2f5d6c480a5';
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
    const balanceCalls = [];
    const stakingTokenCalls = [];

    //  for (const gauge of [...truncatedGauges.lp, ...truncatedGauges.nft]) {
    for (const gauge of [...deployedAeroGauges.lp]) {
        for (const sickle of sickles) {
            balanceCalls.push({ target: gauge, params: [sickle] });
            stakingTokenCalls.push({ target: gauge });
        }
    }

    // Execute the balanceOf and stakingToken queries
    const [resultsWithBalance, stakingTokens] = await Promise.all([
        sdk.api.abi.multiCall({
            abi: 'erc20:balanceOf',
            calls: balanceCalls,
            chain: 'base'
        }),
        sdk.api.abi.multiCall({
            abi: 'function stakingToken() view returns (address)',
            calls: stakingTokenCalls,
            chain: 'base'
        })
    ]);

    // Combine results and sum the balances
    const balances = {};

    resultsWithBalance.output.forEach((balanceResult, index) => {
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
