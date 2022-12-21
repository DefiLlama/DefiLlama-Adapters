const sdk = require("@defillama/sdk");
const fs = require('fs');
const { forEach } = require("../convex/pools-crv");
const { parseUnits } = require('@ethersproject/units');
const { Token } = require('@uniswap/sdk-core');
const { Pool } = require('@uniswap/v3-sdk');
const { JSBI } = require('@uniswap/sdk');
const { getSeparateAmountOfLiquidity } = require('LiquidityUtil.js')
var abi = fs.readFileSync('./projects/sperax-demeter/abi.json');
abi = JSON.parse(abi);
const factory = '0xC4fb09E0CD212367642974F6bA81D8e23780A659'

async function callContract(address, fnAbi, param, chain, block) {
    let result = (await sdk.api.abi.call({
        abi: fnAbi,
        chain: chain,
        target: address,
        params: param,
        block: block
    })).output;
    return result;
}

async function useUniswapPrice(tick, sqrtPriceX96, fee, liquidity, tokenA, tokenB, chain, block, _checkOrder) {
    // OUR FE METHOD (Ignoring for now)
    // const checkOrder = _checkOrder === undefined ? false : _checkOrder;
    // let _decimalA = parseUnits('1', await callContract(tokenA, abi.decimals, [], chain, block));
    // let _decimalB = parseUnits('1', await callContract(tokenB, abi.decimals, [], chain, block));
    // let diffDecimals = _decimalA >= _decimalB ? _decimalA / _decimalB : _decimalB / _decimalA;
    // let scale = new BigNumber(diffDecimals);
    // let sqrtPriceX96Bn = new BigNumber(sqrtPriceX96);
    // let b = new BigNumber('2').pow(192);
    // let price = sqrtPriceX96Bn.pow(2).div(b).times(scale);
    // let priceValue = price.toFixed(18);
    // let priceReversal = new BigNumber('1').div(price);
    // let priceReversalValue = priceReversal.toFixed(18);

    // Uniswap's method
    let chainId = 42161;
    console.log("1");
    // const TokenA = new Token(
    //     chainId, 
    //     tokenA, 
    //     Number(await callContract(tokenA, abi.decimals, [], chain, block)),
    //     await callContract(tokenA, abi.symbol, [], chain, block),
    //     await callContract(tokenA, abi.name, [], chain, block),
    // );
    // console.log("2");
    // const TokenB = new Token(
    //     chainId, 
    //     tokenB,
    //     Number(await callContract(tokenB, abi.decimals, [], chain, block)),
    //     await callContract(tokenB, abi.symbol, [], chain, block),
    //     await callContract(tokenB, abi.name, [], chain, block),    
    // );
    // console.log("3");
    // const poolObj = new Pool(
    // // console.log(
    //     TokenA,
    //     TokenB,
    //     Number(fee),
    //     sqrtPriceX96.toString(),
    //     liquidity.toString(),
    //     Number(tick)
    // );
    console.log("4");
    let decimalA = Number(await callContract(tokenA, abi.decimals, [], chain, block));
    let decimalB = Number(await callContract(tokenB, abi.decimals, [], chain, block));
    
    var perAtoB =JSBI.BigInt(sqrtPriceX96) *JSBI.BigInt(sqrtPriceX96)* (10**(decimalA))/(10**(decimalB))/JSBI.BigInt(2) ** (JSBI.BigInt(192));
    // console.log("Pool ", typeof(poolObj.token0Price));
    console.log(perAtoB);
    

    const [amount0, amount1] = getSeparateAmountOfLiquidity(liquidity, perAtoB, )
    
}

async function tvl(timestamp, ethBlock, chainBlocks) {
    const chain = 'arbitrum';
    const block = chainBlocks[chain];

    let activeFarms = await callContract(factory, abi.getFarmList, [], chain, block);

    totalFarms = activeFarms.length;
    let poolData = {};
    let pool = '';
    let farm = '';
    let liquidity = 0;
    for(let i = 0; i < totalFarms; i++){
        farm = activeFarms[i];
        pool = await callContract(farm, abi.uniswapPool, [], chain, block);
        let rewardFundInfo = await callContract(farm, abi.getRewardFundInfo, [0], chain, block);
        liquidity = rewardFundInfo[0];
        poolData[farm] =
            {
                'pool': pool,
                'slot0': await callContract(pool, abi.slot0, [], chain, block),
                'token0': await callContract(pool, abi.token0, [], chain, block),
                'token1': await callContract(pool, abi.token1, [], chain, block),
                'fee': await callContract(pool, abi.fee, [], chain, block)
            }
            i = 8;
        const tick = poolData[farm]['slot0']['tick'];
        const sqrtPriceX96 = poolData[farm]['slot0']['sqrtPriceX96'];
        console.log("Liquidity : ", liquidity, "Type: ", typeof(liquidity));
        const currentPrice = await useUniswapPrice(tick, sqrtPriceX96, poolData[farm]['fee'], liquidity, poolData[farm]['token0'], poolData[farm]['token1'], chain, block);
        }
    console.log(poolData[farm]['slot0']);

    return {
        activeFarms
    //   tether: tvlInUSD / 1e18
    }
}

module.exports = {
    tvl,
};