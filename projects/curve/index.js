const { unwrapYearn } = require('../helper/unwrapLPs');
const { getChainTransform } = require('../helper/portedTokens');
const { staking } = require("../helper/staking.js");
const BigNumber = require("bignumber.js");
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const creamAbi = require('../helper/abis/cream.json');
const contracts = require("./contracts.json");
const chains = [
    //"ethereum",
    //"polygon",
    "arbitrum",
    "aurora",
    "avax",
    "fantom",
    "harmony",
    "optimism",
    //"xdai",
    //"moonbeam"
]// Object.keys(contracts);

async function getPools(block, chain, registry) {
    const poolCount = (await sdk.api.abi.call({
        block,
        chain,
        target: registry,
        abi: abi.pool_count
    })).output;

    return (await sdk.api.abi.multiCall({
        calls: [...Array(Number(poolCount)).keys()].map((n) => ({
            params: n
        })),
        block,
        chain,
        target: registry,
        abi: abi.pool_list
    })).output;
};

function aggregateBalanceCalls(coins, nCoins, poolList) {
    let calls = [];
    coins.map((coin, i) => (
        [...Array(Number(nCoins[i].output[0])).keys()].map(n => (
            calls.push({
                params: [poolList[i].output],
                target: coin.output[n]
            })))
    ));
    return calls;
};

async function fixGasTokenBalances(poolBalances, block, chain) {
    for (let i = 0; i < poolBalances.output.length; i++) {
        if (poolBalances.output[i].success == false
            && poolBalances.output[i].input.target == contracts[chain].gasTokenDummy) {

            const ethBalance = (await sdk.api.eth.getBalance({
                target: poolBalances.output[i].input.params[0],
                block,
                chain
            })).output;
            poolBalances.output[i].success = true;
            poolBalances.output[i].output = ethBalance;
            poolBalances.output[i].input.target = contracts[chain].wrapped;
        };
    };
};

async function fixWrappedTokenBalances(balances, block, chain, transform) {
    if ('yearnTokens' in contracts[chain]) {
        for (let token of Object.values(contracts[chain].yearnTokens)) {
            if (token in balances) {
                await unwrapYearn(balances, token, block, chain, transform);
            };
        };
    };

    if ('creamTokens' in contracts[chain]) {
        const creamTokens = Object.values(contracts[chain].creamTokens);
        if (creamTokens.length > 0) {
            await unwrapCreamTokens(balances, block, chain, creamTokens, transform);
        };
    };
};

async function unwrapCreamTokens(balances, block, chain, creamTokens, transform) {
    const [exchangeRates, underlyingTokens] = await Promise.all([
        sdk.api.abi.multiCall({
            calls: creamTokens.map(t => ({
                target: t
            })),
            abi: creamAbi.exchangeRateStored,
            block,
            chain
        }),
        sdk.api.abi.multiCall({
            calls: creamTokens.map(t => ({
                target: t
            })),
            abi: creamAbi.underlying,
            block,
            chain
        })
    ]);
    for (let i = 0; i < creamTokens.length; i++) {
        if (!(creamTokens[i] in balances)) continue;
        const underlying = underlyingTokens.output[i].output
        const balance = BigNumber(balances[creamTokens[i]]).times(exchangeRates.output[i].output).div(1e18).toFixed(0)
        sdk.util.sumSingleBalance(
            balances,
            transform(underlying),
            balance
        );
        delete balances[creamTokens[i]]
    };
};

function deleteMetapoolBaseBalances(balances, chain) {
    for (let token of Object.values(contracts[chain].metapoolBases)) {
        if (!(token in balances)) continue;
        delete balances[token];
    };
};

function mapGaugeTokenBalances(calls) {
    const mapping = { // token listed in coins() mapped to gauge token held in contract
        "0xe7a24ef0c5e95ffb0f6684b813a78f2a3ad7d171": "0x19793b454d3afc7b454f206ffe95ade26ca6912c",
        "0x7f90122bf0700f9e7e1f688fe926940e8839f353": "0xbf7e49483881c76487b0989cd7d9a8239b20ca41",
        "0xd02a30d33153877bc20e5721ee53dedee0422b2f": "0xd4f94d0aaa640bbb72b5eec2d85f6d114d81a88e",
        //"0x1337bedc9d22ecbe766df105c9623922a27963ec": "0x7f90122bf0700f9e7e1f688fe926940e8839f353"
    };

    let a = calls.map(c => ({
        target: mapping[c.target.toLowerCase()] || c.target,
        params: c.params
    }));

    return a;
};

async function unwrapPools(balances, block, chain, transform, target, nCoinsAbi, getCoinsAbi) {
    const poolList = await getPools(block, chain, target)

    const [{ output: nCoins }, { output: coins }] = await Promise.all([
        sdk.api.abi.multiCall({
            calls: poolList.map((p) => ({
                params: p.output
            })),
            block,
            chain,
            target,
            abi: nCoinsAbi
        }),
        sdk.api.abi.multiCall({
            calls: poolList.map((p) => ({
                params: p.output
            })),
            block,
            chain,
            target,
            abi: getCoinsAbi
        })
    ]);

    let calls = aggregateBalanceCalls(coins, nCoins, poolList);
    calls = mapGaugeTokenBalances(calls);

    let poolBalances = await sdk.api.abi.multiCall({
        calls,
        block,
        chain,
        abi: 'erc20:balanceOf'
    });


    await fixGasTokenBalances(poolBalances, block, chain);
    try {
    sdk.util.sumMultiBalanceOf(balances, poolBalances, true, transform);
    } catch (e) {
        console.log(e)
        let a = chain
         console.log(chain)
         
    }
    await fixWrappedTokenBalances(balances, block, chain, transform);
    deleteMetapoolBaseBalances(balances, chain);

    return balances;
};

function tvl(chain) {
    return async (_t, _e, chainBlocks) => {
        let balances = {};
        const transform = await getChainTransform(chain);

        const registry = (await sdk.api.abi.call({
            block: chainBlocks[chain],
            chain,
            target: contracts[chain].addressProvider,
            abi: abi.get_registry
        })).output;

        await unwrapPools(
            balances,
            chainBlocks[chain],
            chain,
            transform,
            registry,
            abi.get_n_coins,
            abi.get_coins
        );

        if (!('metapoolFactory' in contracts[chain])) return balances;

        await unwrapPools(
            balances,
            chainBlocks[chain],
            chain,
            transform,
            contracts[chain].metapoolFactory,
            abi.get_n_coins_metapool,
            abi.get_coins_metapool
        );

        return balances;
    }; // node test.js projects/curve/index.js
};

const chainTypeExports = (chains) => {
    let exports = chains.reduce((obj, chain) => (
        { ...obj, [chain]: { tvl: tvl(chain) } }
    ), {});
    //exports.ethereum['staking'] = staking(contracts.ethereum.veCRV, contracts.ethereum.CRV);
    return exports;
};

module.exports = chainTypeExports(chains);