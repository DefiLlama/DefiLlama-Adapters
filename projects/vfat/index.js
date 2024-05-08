const { getLogs } = require('../helper/cache/getLogs')
const abi = require('./gauge.json');
const sdk = require('@defillama/sdk')

async function tvl(api) {
    const factory = '0x71D234A3e1dfC161cc1d081E6496e76627baAc31'
    const gaugeFactory = '0x35f35cA5B132CaDf2916BaB57639128eAC5bbcb5'
    const gaugeFactory2 = '0xD30677bd8dd15132F251Cb54CbDA552d2A05Fb08'
    const voter = '0x16613524e02ad97edfef371bc883f2f5d6c480a5'
    const fromBlock = 3200567
    const fromBlockSickle = 12116234

    const [deployLogs, deployAeroLogs] = await Promise.all([
        getLogs({
            api,
            target: factory,
            topic: 'Deploy(address,address)',
            fromBlockSickle,
            eventAbi: 'event Deploy(address indexed admin, address sickle)'
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
            )`
        })
    ]);

    const sickles = deployLogs.map(log => log.args[1]);
    
     // Separate gauges by type
     const deployedAeroGauges = deployAeroLogs.reduce((acc, log) => {
        const gaugeFactoryAddress = log.args[2];
        const gaugeAddress = log.args[6];
        if (gaugeFactoryAddress === gaugeFactory) {
            acc.lp.push(gaugeAddress);
        } else if (gaugeFactoryAddress === gaugeFactory2) {
            acc.nft.push(gaugeAddress);
        }
        return acc;
    }, { lp: [], nft: [] });


    const depositLogs = await getLogs({
        api,
        target: voter, //todo change to the correct target
        topic: 'Deposit(address,address,uint256)',
        fromBlockSickle,
        eventAbi: 'event Deposit(address indexed from, address indexed to, uint256 amount)'
    });



    return 0
}

module.exports = {
    base: {
        tvl,
    },
}
