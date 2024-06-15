const sdk = require('@defillama/sdk');
const BigNumber = require("bignumber.js");
const abi = require('../helper/abis/tivel-finance.json');
const { convertToBigInt } = require('@defillama/sdk/build/generalUtil');

async function getPoolAddresses(factoryAddress, block, chain) {
    const poolLengthRaw = (
        await sdk.api.abi.call({
            target: factoryAddress,
            abi: abi["poolLength"],
            block,
            chain
        })
    ).output;
    const poolLength = convertToBigInt(poolLengthRaw);
    const args = [];
    for (let i = 0; i < poolLength; i++) {
        args.push(i);
    }
    const poolAddresses = (await sdk.api.abi.multiCall({
        block,
        calls: args.map((i) => ({
            target: factoryAddress,
            params: i,
        })),
        abi: abi["pools"],
        chain
    })
    ).output;

    return poolAddresses;
}

async function getPoolDetails(poolAddresses, block, chain) {
    const [tokens, reserves, withdrawingLiquidities] = await Promise.all([
        sdk.api.abi.multiCall({
            abi: abi["quoteToken"],
            calls: poolAddresses.map((i) => ({
                target: i.output,
            })),
            block,
            chain
        }),
        sdk.api.abi.multiCall({
            abi: abi["quoteReserve"],
            calls: poolAddresses.map((i) => ({
                target: i.output,
            })),
            block,
            chain
        }),
        sdk.api.abi.multiCall({
            abi: abi["withdrawingLiquidity"],
            calls: poolAddresses.map((i) => ({
                target: i.output,
            })),
            block,
            chain
        }),
    ]);

    return [tokens.output, reserves.output, withdrawingLiquidities.output]
}

function tvl(balances, tokens, reserves, withdrawingLiquidities) {
    tokens.forEach((value, idx) => {
        const token = value.output;
        const reserve = BigNumber(reserves[idx].output);
        const withdrawingLiquidity = BigNumber(withdrawingLiquidities[idx].output);
        const balance = reserve < withdrawingLiquidity ? "0" : reserve.minus(withdrawingLiquidity).toFixed(0);
        sdk.util.sumSingleBalance(balances, token, balance);
    });
}

module.exports = {
    getPoolAddresses,
    getPoolDetails,
    tvl,
}