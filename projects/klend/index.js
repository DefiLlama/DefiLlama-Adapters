const sdk = require('@defillama/sdk');
const {compoundExports} = require('../helper/compound');
const {unwrapUniswapLPs} = require('../helper/unwrapLPs');

// BSC
const unitroller = "0xA6bEd5B7320941eA185A315D1292492F7Fdd1e5c";
const kBnb = "0x2C334c6cBC0547e759084bD8D469f933B17Ff481";
const wbnb = "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c"
const bscPools = [
    "0xf1D447656692d51d4DB7057104Ac6E97029A7790",
    "0x95D4D2D88C96cE96c97A912Aa7122715716013D4"
];
const okexPools = [
    "0x2404c9F6Ba2d4D5c73d86b3E3b9D7F6c70ba3448",
    "0x5A74de8e3D0c46c106AB769d50bf9CAF8681D30d"
];
const lpAbi = {"constant":true,"inputs":[],"name":"lp","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"};

// OKEX
const okexUnitroller = "0x9589c9c9b7A484F57d69aC09c14EcE4b6d785710";
const kOkt = "0x4923abEe988f7bB7A9ae136BEBE4A8455e8dE229";
const wokt = "0x8f8526dbfd6e38e3d8307702ca8469bae6c56c15"

async function pool2Tvl(balances, chainBlocks, chain, pools) {

    let lpofPools = (await sdk.api.abi.multiCall({
        calls: pools.map(p => ({
            target: p
        })),
        abi: lpAbi,
        block: chainBlocks,
        chain: chain
    })).output;

    let lpBalances = (await sdk.api.abi.multiCall({
        calls: lpofPools.map(p => ({
            target: p.output,
            params: p.input.target
        })),
        abi: "erc20:balanceOf",
        block: chainBlocks,
        chain: chain
    })).output;

    let lpPositions = [];
    for (let i in lpBalances) {
        lpPositions.push({
            balance: lpBalances[i].output,
            token: lpBalances[i].input.target
        });
    }

    await unwrapUniswapLPs(balances, lpPositions, chainBlocks, chain, addr=>`${chain}:${addr}`);

}

async function bscPool2(timestamp, block, chainBlocks) {
    let balances = {};

    await pool2Tvl(balances, chainBlocks.bsc, "bsc", bscPools);

    return balances;
}

async function okexPool2(timestamp, block, chainBlocks) {
    let balances = {};

    await pool2Tvl(balances, chainBlocks.okexchain, "okexchain", okexPools);

    return balances;
}

module.exports = {
    timetravel: true,
    doublecounted: false,
    bsc: {
        ...compoundExports(unitroller, "bsc", kBnb, wbnb),
        pool2: bscPool2
    },
    okexchain: {
        ...compoundExports(okexUnitroller, "okexchain", kOkt, wokt),
        pool2: okexPool2
    }
}