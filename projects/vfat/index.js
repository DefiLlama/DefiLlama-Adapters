const { getLogs } = require('../helper/cache/getLogs');
const sdk = require('@defillama/sdk');

async function tvl(api) {
    const factory = '0x71D234A3e1dfC161cc1d081E6496e76627baAc31';
    const gaugeFactory = '0x35f35cA5B132CaDf2916BaB57639128eAC5bbcb5';
    const gaugeFactory2 = '0xD30677bd8dd15132F251Cb54CbDA552d2A05Fb08';
    const voter = '0x16613524e02ad97edfef371bc883f2f5d6c480a5';
    const fromBlock = 3200567;
    const fromBlockSickle = 12116234;
    console.log("fetching logs")
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

    const sickles = deployLogs.map(log => log.args[1]);
    console.log("fetching sickles")
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

    const truncatedGauges = {
        lp: deployedAeroGauges.lp.slice(0, 100),
        nft: deployedAeroGauges.nft.slice(0, 20),
    };
    console.log("fetching balances logs")
    // Create promises for fetching deposit logs for lp and nft gauges
    const depositLogPromises = [
        ...truncatedGauges.lp.map(gauge =>
            getLogs({
                api,
                target: gauge,
                topic: 'Deposit(address,address,uint256)',
                fromBlock: fromBlockSickle,
                eventAbi: 'event Deposit(address indexed from, address indexed to, uint256 amount)',
            }).then(logs => logs.map(log => ({ ...log, gauge, type: 'lp' })))  // Append gauge address and type (lp)
        ),
        ...truncatedGauges.nft.map(gauge =>
            getLogs({
                api,
                target: gauge,
                topic: 'Deposit(address,address,uint256)',
                fromBlock: fromBlockSickle,
                eventAbi: 'event Deposit(address indexed from, address indexed to, uint256 amount)',
            }).then(logs => logs.map(log => ({ ...log, gauge, type: 'nft' })))  // Append gauge address and type (nft)
        ),
    ];

    const allDepositLogs = await Promise.all(depositLogPromises);
    const depositLogs = allDepositLogs.flat();  // Flatten to get a single array of logs

    // Filter the deposit logs to include only those where `args[1]` (to address) is in the sickles list
    const filteredDepositLogs = depositLogs.filter(log => sickles.includes(log.args[1]));

    // Now map to include the gauge address, sickle address, and pool type
    const result = filteredDepositLogs.map(log => ({
        sickle: log.args[1],  // The address making the deposit
        gauge: log.gauge,    // The gauge address
        type: log.type       // Pool type (lp or nft)
    }));

    console.log("fetching balances")
    const [resultsWithBalance, stakingTokens] = await Promise.all([
        sdk.api.abi.multiCall({
            abi: 'erc20:balanceOf',
            calls: filteredDepositLogs.map(log => ({
                target: log.gauge,
                params: [log.args[1]] // The sickle address
            })),
            chain: 'base'
        }),
        sdk.api.abi.multiCall({
            abi: 'function stakingToken() view returns (address)',
            calls: filteredDepositLogs.map(log => ({
                target: log.gauge
            })),
            chain: 'base'
        })
    ]);

    const resultsWithBalancesAndTokens = filteredDepositLogs.map((log, index) => {
        const balance = resultsWithBalance.output[index].output;
        const stakingTokenAddress = stakingTokens.output[index].output;
        return {
            ...log,
            balance,
            stakingToken: stakingTokenAddress
        };
    }).filter(log => log.balance !== '0'); // Filter out any logs with a zero balance

    console.log("fetching balances sum")

    const balances = resultsWithBalancesAndTokens.reduce((acc, log) => {
        const { balance, stakingToken, type } = log;
        sdk.util.sumSingleBalance(acc, stakingToken, balance, 'base');
        return acc;
    }, {});


    return balances;
}

module.exports = {
    base: {
        tvl,
    },
};

// todo handle nft gauges