const sdk = require("@defillama/sdk");
const fs = require('fs');
const { parseUnits } = require('@ethersproject/units');
const BigNumber = require('bignumber.js');
const { getSeparateAmountOfLiquidity } = require('./LiquidityUtil')
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

function toPlainString(num) {
    return (''+ +num).replace(/(-?)(\d*)\.?(\d*)e([+-]\d+)/,
      function(a,b,c,d,e) {
        return e < 0
          ? b + '0.' + Array(1-e-c.length).join(0) + c + d
          : b + c + d + Array(e-d.length+1).join(0);
      });
  }

async function calculateTokenAmounts(tickLower, tickUpper, sqrtPriceX96, liquidity, tokenA, tokenB, chain, block, _checkOrder) {
    let tokenAdecimals = Number(await callContract(tokenA, abi.decimals, [], chain, block));
    let tokenBdecimals = Number(await callContract(tokenB, abi.decimals, [], chain, block));
    let decimalA = parseUnits('1', tokenAdecimals);
    let decimalB = parseUnits('1', tokenBdecimals);
    let diffDecimals = tokenAdecimals >= tokenBdecimals ? tokenAdecimals / tokenBdecimals : tokenBdecimals / tokenAdecimals;
    let scale = new BigNumber(diffDecimals);
    let sqrtPriceX96Bn = new BigNumber(sqrtPriceX96);
    let b = new BigNumber('2').pow(192);
    let price = sqrtPriceX96Bn.pow(2).div(b).times(scale);
    const [amountA, amountB] = getSeparateAmountOfLiquidity(liquidity, price, tickLower, tickUpper, decimalA, decimalB);
    
    return [tokenA, amountA, tokenB, amountB];
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
    const balances = {};
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
        const tickLower = await callContract(farm, abi.tickLowerAllowed, [], chain, block);
        const tickUpper = await callContract(farm, abi.tickUpperAllowed, [], chain, block);
        const sqrtPriceX96 = poolData[farm]['slot0']['sqrtPriceX96'];
        const [tokenA, amountA, tokenB, amountB] = await calculateTokenAmounts(tickLower, tickUpper, sqrtPriceX96, liquidity, poolData[farm]['token0'], poolData[farm]['token1'], chain, block);
        // await sdk.util.sumSingleBalance(balances, `arbitrum:${tokenA}`, toPlainString(amountA));
        // await sdk.util.sumSingleBalance(balances, `arbitrum:${tokenB}`, toPlainString(amountB));
        await sdk.util.sumSingleBalance(balances, tokenA, toPlainString(amountA));
        await sdk.util.sumSingleBalance(balances, tokenB, toPlainString(amountB));
    }

    return {
        balances
    }
}

module.exports = {
    tvl,
};