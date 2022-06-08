const { sumTokensAndLPsSharedOwners, unwrapCrv, unwrapYearn } = require('../helper/unwrapLPs');
const { getChainTransform } = require('../helper/portedTokens');
const { staking } = require("../helper/staking.js");
const BigNumber = require("bignumber.js");
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const creamAbi = require('../helper/abis/cream.json')
const contracts = require("./contracts.json");
const chain = "ethereum";

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
            && poolBalances.output[i].input.target == contracts.gasTokenDummy) {

            const ethBalance = (await sdk.api.eth.getBalance({
                target: poolBalances.output[i].input.params[0],
                block,
                chain
            })).output;
            poolBalances.output[i].success = true;
            poolBalances.output[i].output = ethBalance;
            poolBalances.output[i].input.target = contracts.WETH;
        };
    };
};

async function fixWrappedTokenBalances(balances, block, chain, transform) {
    for (let token of Object.values(contracts.yearnTokens)) {
        if (token in balances) {
            await unwrapYearn(balances, token, block, chain, transform)
        }
    }
    for (let token of Object.values(contracts.creamTokens)) {
        if (token in balances) {
            await unwrapCreamTokens(balances, block, chain, Object.values(contracts.creamTokens), transform)
        }
    }
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

function deleteMetapoolBaseBalances(balances) {
    for (let token of Object.values(contracts.metapoolBases)) {
        if (!(token in balances)) continue;
        delete balances[token];
    };
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

    let poolBalances = await sdk.api.abi.multiCall({
        calls: aggregateBalanceCalls(coins, nCoins, poolList),
        block,
        chain,
        abi: 'erc20:balanceOf'
    });

    await fixGasTokenBalances(poolBalances, block, chain);
    sdk.util.sumMultiBalanceOf(balances, poolBalances, true, transform);

    await fixWrappedTokenBalances(balances, block, chain, transform);
    deleteMetapoolBaseBalances(balances);

    return balances;
};

async function tvl(_t, _e, chainBlocks) {
    let balances = {};
    const transform = await getChainTransform(chain);

    const registry = (await sdk.api.abi.call({
        block: chainBlocks[chain],
        chain,
        target: contracts.addressProvider,
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

    await unwrapPools(
        balances, 
        chainBlocks[chain], 
        chain,
        transform, 
        contracts.metapoolFactory, 
        abi.get_n_coins_metapool, 
        abi.get_coins_metapool
        );

    return balances;
}; // node test.js projects/curve/index.js

module.exports = {
    ethereum: {
        tvl,
        staking: staking(contracts.veCRV, contracts.CRV),
    }
};