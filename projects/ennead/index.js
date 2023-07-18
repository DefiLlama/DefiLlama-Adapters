const sdk = require("@defillama/sdk");
const { staking, stakingUnknownPricedLP } = require("../helper/staking");
const { unwrapUniswapLPs, unwrapUniswapV3NFTs } = require('../helper/unwrapLPs');
const lensAbi = require("./ramsesLens.json");

const emptyAddress = '0x0000000000000000000000000000000000000000';
// Ramses contracts
const ramsesLens = '0xAAA68f40515bCcd8e407EBB4dBdF5046D105621e';
const nfpManager = '0xAA277CB7914b7e5514946Da92cb9De332Ce610EF';

// Ennead contracts
// arbi
const neadRam = '0x40301951Af3f80b8C1744ca77E55111dd3c1dba1';
const neadStake = '0x7D07A61b8c18cb614B99aF7B90cBBc8cD8C72680';
const lpDepositor = '0x1863736c768f232189F95428b5ed9A51B0eCcAe5';
const neadNfpDepositor = '0xe99ead648Fb2893d1CFA4e8Fe8B67B35572d2581';
// avax
const neadStake_avax = '0xe99ead39204bd394e56502A3ad56d7061EE6B1c7';
const neadSnek = '0xe99ead9519239F3eAad9339292d8A399739Cd55d';
const neadSnekLp = '0x82360748aC3D7045812c6783f355b41193d3492E';
const snekView = '0xe99eadc22747c95c658f41a02F1c6C2CcAefA757';
const booster = '0xe99ead683Dcf1eF0C7F6612be5098BC5fDF4998d';

async function arbiTvl(timestamp, block, chainBlocks, { chain }) {
    let balances = {};

    let poolsAddresses = (await sdk.api.abi.call({
        target: ramsesLens,
        abi: lensAbi.allPools,
        chain: chain
    })).output;

    let gauges = (await sdk.api.abi.multiCall({
        target: ramsesLens,
        calls: poolsAddresses.map(pool => ({ params: pool })),
        abi: lensAbi.gaugeForPool,
        chain: chain
    })).output;

    // Remove pools with no gauges
    const toRemove = gauges.reduce((indices, gauge, index) => {
        if (gauge.output == emptyAddress) {
            indices.push(index);
        }
        return indices;
    }, []);

    if (toRemove.length > 0) {
        toRemove.sort((a, b) => b - a);
        toRemove.forEach(index => {
            poolsAddresses.splice(index, 1);
            gauges.splice(index, 1);
        });
    };

    const lpBalances = (await sdk.api.abi.multiCall({
        calls: gauges.map(gauge => ({ target: gauge.output, params: lpDepositor })),
        abi: "function balanceOf(address) view returns (uint256)",
        chain: chain
    })).output;

    await unwrapUniswapLPs(
        balances,
        poolsAddresses.map((pool, index) => ({ token: pool, balance: lpBalances[index].output })),
        chainBlocks.arbitrum,
        chain = chain,
    );

    await unwrapUniswapV3NFTs({
        balances,
        nftsAndOwners: [[nfpManager, neadNfpDepositor],],
        block: chainBlocks.arbitrum,
        chain: chain
    });

    return balances;
}

async function avaxTvl(timestamp, block, chainBlocks, { chain }) {
    let balances = {};

    const poolsAddresses = (await sdk.api.abi.call({
        target: snekView,
        abi: lensAbi.allActivePools,
        chain: chain
    })).output;

    /*
    const stakingPositions = (await sdk.api.abi.call({
        target: snekView,
        params: booster,
        abi: lensAbi.allStakingPositionsOf,
        chain: chain
    })).output;
    
    const lpBalances = [];
    for (let i = 0; i < stakingPositions.length; i++) {
        lpBalances.push(stakingPositions[i].balance);
    }
    */

    const gauges = (await sdk.api.abi.call({
        target: snekView,
        abi: lensAbi.allGauges,
        chain: chain
    })).output;


    const lpBalances = (await sdk.api.abi.multiCall({
        calls: gauges.map(gauge => ({ target: gauge, params: booster })),
        abi: "function balanceOf(address) view returns (uint256)",
        chain: chain
    })).output;


    await unwrapUniswapLPs(
        balances,
        poolsAddresses.map((pool, index) => ({ token: pool, balance: lpBalances[index].output })),
        chainBlocks.avax,
        chain = chain
    );

    return balances;
}


module.exports = {
    arbitrum: {
        staking: staking(neadStake, neadRam),
        tvl: arbiTvl,
    },
    avax: {
        staking: stakingUnknownPricedLP(neadStake_avax, neadSnek, chain = 'avax', lpContract = neadSnekLp), //not accurate
        tvl: avaxTvl
    }
};