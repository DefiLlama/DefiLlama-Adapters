/*
//const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs } = require('../helper/cache/getLogs')
const abi = require('./gauge.json');
const sdk = require('@defillama/sdk')

async function tvl(api) {
    const factory = '0x71D234A3e1dfC161cc1d081E6496e76627baAc31'
    const gaugeFactory = '0x35f35cA5B132CaDf2916BaB57639128eAC5bbcb5'
    const gaugeFactory2 = '0xD30677bd8dd15132F251Cb54CbDA552d2A05Fb08'
    const voter = '0x16613524e02ad97edfef371bc883f2f5d6c480a5'
    const fromBlock = 3200567

    const deployLogs = await getLogs({
        api,
        target: factory,
        topic: 'Deploy(address,address)',
        fromBlock,
        eventAbi: 'event Deploy(address indexed admin, address sickle)'
    });

    let sickles = []
    deployLogs.forEach(log => {
        sickles.push(log.args[1])
    })

    const deployAeroLogs = await getLogs({
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
    });

    let deployedAeroGaugesLP = [];
    let deployedAeroGaugesNFT = [];

    deployAeroLogs.forEach(log => {
        const gaugeFactoryAddress = log.args[2]; // gaugeFactory address
        const gaugeAddress = log.args[6]; // gauge address

        if (gaugeFactoryAddress === gaugeFactory) {
            deployedAeroGaugesLP.push(gaugeAddress);
        } else if (gaugeFactoryAddress === gaugeFactory2) {
            deployedAeroGaugesNFT.push(gaugeAddress);
        }
    });

    //console.log('LP gauges: ', deployedAeroGaugesLP.length);
    //console.log('NFT gauges: ', deployedAeroGaugesNFT.length);

    const rewardRatesLP = await sdk.api.abi.multiCall({
        abi: abi.rewardRate,
        calls: deployedAeroGaugesLP.map(gauge => ({
            target: gauge,
            params: []
        })),
        chain: 'base'
    });

    const rewardRatesNFT = await sdk.api.abi.multiCall({
        abi: abi.rewardRate,
        calls: deployedAeroGaugesNFT.map(gauge => ({
            target: gauge,
            params: []
        })),
        chain: 'base'
    });

    // remove pools with 0 rewardRate from deployedAeroGaugesLP and deployedAeroGaugesNFT
    deployedAeroGaugesLP = deployedAeroGaugesLP.filter((gauge, idx) => rewardRatesLP.output[idx].output !== '0');
    deployedAeroGaugesNFT = deployedAeroGaugesNFT.filter((gauge, idx) => rewardRatesNFT.output[idx].output !== '0');

    //console.log('LP gauges: ', deployedAeroGaugesLP.length);
    //console.log('NFT gauges: ', deployedAeroGaugesNFT.length);

    // for each sickle, call balanceOf on each gauge
   
    for (const sickle of sickles) {
        const balanceOfLP = await sdk.api.abi.multiCall({
            abi: 'erc20:balanceOf',
            calls: deployedAeroGaugesLP.map(gauge => ({
                target: gauge,
                params: sickle
            })),
            chain: 'base'
        });
    
        console.log(balanceOfLP);
    }

    // for each sickle, call balanceOf on each gauge    
    for (const sickle of sickles) {
        const balanceOfNFT = await sdk.api.abi.multiCall({
            abi: 'erc20:balanceOf',
            calls: deployedAeroGaugesNFT.map(gauge => ({
                target: gauge,
                params: sickle
            })),
            chain: 'base'
        });
    
        console.log(balanceOfNFT);
    }


    return 0
}

module.exports = {
    base: {
        tvl,
    },
}
*/
const sdk = require('@defillama/sdk')
const { getLogs } = require('../helper/cache/getLogs')
const abi = require('./gauge.json')

async function tvl(api) {
    const factory = '0x71D234A3e1dfC161cc1d081E6496e76627baAc31'
    const gaugeFactory = '0x35f35cA5B132CaDf2916BaB57639128eAC5bbcb5'
    const gaugeFactory2 = '0xD30677bd8dd15132F251Cb54CbDA552d2A05Fb08'
    const voter = '0x16613524e02ad97edfef371bc883f2f5d6c480a5'
    const fromBlock = 3200567

    // Retrieve the logs concurrently
    const [deployLogs, deployAeroLogs] = await Promise.all([
        getLogs({
            api,
            target: factory,
            topic: 'Deploy(address,address)',
            fromBlock,
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

    // Fetch reward rates concurrently
    const [rewardRatesLP, rewardRatesNFT] = await Promise.all([
        sdk.api.abi.multiCall({
            abi: abi.rewardRate,
            calls: deployedAeroGauges.lp.map(gauge => ({ target: gauge })),
            chain: 'base'
        }),
        sdk.api.abi.multiCall({
            abi: abi.rewardRate,
            calls: deployedAeroGauges.nft.map(gauge => ({ target: gauge })),
            chain: 'base'
        })
    ]);

    // Filter out gauges with a reward rate of '0'
    deployedAeroGauges.lp = deployedAeroGauges.lp.filter((_, idx) => rewardRatesLP.output[idx].output !== '0');
    deployedAeroGauges.nft = deployedAeroGauges.nft.filter((_, idx) => rewardRatesNFT.output[idx].output !== '0');

    async function processBatch(calls, batchSize) {
        let results = [];
        for (let i = 0; i < calls.length; i += batchSize) {
            const batch = calls.slice(i, i + batchSize);
            const responses = await sdk.api.abi.multiCall({
                abi: 'erc20:balanceOf',
                calls: batch,
                chain: 'base'
            }).catch(error => {
                console.error('Batch request failed:', error);
                return { output: batch.map(() => ({ output: 'error' })) }; // handle errors gracefully
            });
            results = results.concat(responses.output);
            console.log('Processed', results.length, 'calls');
        }
        return results;
    }

    // Updated getGaugeBalances to use batching
    async function getGaugeBalances(gauges, sickles, batchSize = 150) {
        const allCalls = gauges.flatMap(gauge => sickles.map(sickle => ({
            target: gauge, params: sickle
        })));

        const batchedResults = await processBatch(allCalls, batchSize);
        return sickles.map((sickle, index) => ({
            sickle: sickle,
            balances: batchedResults.slice(index * gauges.length, (index + 1) * gauges.length)
        }));
    }

    async function getGaugeBalancesNFT(gauges, sickles) {
        const balancePromises = sickles.map(sickle => 
            sdk.api.abi.multiCall({
                abi: 'function stakedValues(address depositor) view returns (uint256[])',
                calls: gauges.map(gauge => ({ target: gauge, params: sickle })),
                chain: 'base'
            })
        );
        const balanceResults = await Promise.all(balancePromises);
        return balanceResults.map((res, index) => ({
            sickle: sickles[index],
            balances: res.output
        }));
    }


    // Fetch LP and NFT balances concurrently
    const [lpBalances, nftBalances] = await Promise.all([
        getGaugeBalances(deployedAeroGauges.lp, sickles),
        getGaugeBalancesNFT(deployedAeroGauges.nft, sickles)
    ]);

    //console.log('LP Gauges Balances:', lpBalances);
    //console.log('NFT Gauges Balances:', nftBalances);

    return 0;
}

module.exports = {
    base: {
        tvl,
    },
}
