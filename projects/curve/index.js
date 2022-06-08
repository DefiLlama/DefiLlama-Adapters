const { sumTokensAndLPsSharedOwners, unwrapCrv, unwrapYearn } = require('../helper/unwrapLPs');
const { getChainTransform } = require('../helper/portedTokens');
const BigNumber = require("bignumber.js");
const sdk = require("@defillama/sdk");
const abi = require("./abi2.json");
const creamAbi = require('../helper/abis/cream.json')

const contracts = {
    "addressProvider": "0x0000000022D53366457F9d5E68Ec105046FC4383",
    "metapoolFactory": "0xB9fC157394Af804a3578134A6585C0dc9cc990d4",
    "gasTokenDummy": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    "metapoolBases": {
        "3CRV-eth": "0x6c3f90f043a72fa612cbac8115ee7e52bde6e490",
        "crvRenWSBTC": "0x075b1bb99792c9e1041ba13afef80c91a1e70fb3"
    },
    "WETH": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    "yearnTokens": {
        "yDAI": "0xc2cb1040220768554cf699b0d863a3cd4324ce32",
        "yUSDT": "0xe6354ed5bc4b393a5aad09f21c46e101e692d447",
        "yDAI": "0x16de59092dae5ccf4a1e6439d611fd0653f0bd01",
        "yUSDC": "0xd6ad7a6750a7593e092a9b218d66c0a814a3436e",
        "yUSDT": "0x83f798e925bcd4017eb265844fddabb448f1707d",
        "ycDAI": "0x99d1fa417f94dcd62bfe781a1213c092a47041bc",
        "ycUSDC": "0x9777d7e2b60bb01759d0e2f8be2095df444cb07e",
        "ycUSDT": "0x1be5d71f2da660bfdee8012ddc58d024448a0a59",
    },
    "creamTokens": {
        "cyDAI": "0x8e595470ed749b85c6f7669de83eae304c2ec68f",
        "cyUSDC": "0x76eb2fe28b36b3ee97f3adae0c69606eedb2a37c",
        "cyUSDT": "0x48759f220ed983db51fa7a8c0d2aab8f3ce4166a",
    },
};
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

async function tvl(_t, _e, chainBlocks) {
    let balances = {};
    const block = chainBlocks[chain];
    const transform = await getChainTransform(chain);

    const registry = (await sdk.api.abi.call({
        block,
        chain,
        target: contracts.addressProvider,
        abi: abi.get_registry
    })).output;

    const poolList = await getPools(block, chain, registry);

    const [{ output: nCoins }, { output: coins }] = await Promise.all([
        sdk.api.abi.multiCall({
            calls: poolList.map((p) => ({
                params: p.output
            })),
            block,
            chain,
            target: registry,
            abi: abi.get_n_coins
        }),
        sdk.api.abi.multiCall({
            calls: poolList.map((p) => ({
                params: p.output
            })),
            block,
            chain,
            target: registry,
            abi: abi.get_coins
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
}; // node test.js projects/curve/index.js

module.exports = {
    ethereum: {
        tvl
    }
};