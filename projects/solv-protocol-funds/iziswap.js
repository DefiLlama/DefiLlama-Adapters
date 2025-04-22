function point2PoolPriceUndecimalSqrt(point) {
    return (1.0001 ** point) ** 0.5;
}

function _getAmountY(
    liquidity,
    sqrtPriceL,
    sqrtPriceR,
    sqrtRate,
    upper,
) {
    const numerator = sqrtPriceR - sqrtPriceL;
    const denominator = sqrtRate - 1;
    const ratio = numerator / denominator
    return liquidity * ratio
}

function _liquidity2AmountYAtPoint(
    liquidity,
    sqrtPrice,
    upper
) {
    const amountY = liquidity * sqrtPrice
    return amountY
}

function _getAmountX(
    liquidity,
    leftPt,
    rightPt,
    sqrtPriceR,
    sqrtRate,
    upper,
) {
    const sqrtPricePrPc = Math.pow(sqrtRate, rightPt - leftPt + 1);
    const sqrtPricePrPd = Math.pow(sqrtRate, rightPt + 1);

    const numerator = sqrtPricePrPc - sqrtRate;
    const denominator = sqrtPricePrPd - sqrtPriceR;
    const ratio = numerator / denominator
    return liquidity * ratio
}

function _liquidity2AmountXAtPoint(
    liquidity,
    sqrtPrice,
    upper
) {
    return liquidity / sqrtPrice
}

function getAmounts(
    stateInfo,
    liquidity
) {
    let amountX = 0;
    let amountY = 0;
    const liquid = liquidity[2];
    const sqrtRate = Math.sqrt(1.0001);
    const leftPtNum = Number(liquidity[0]);
    const rightPtNum = Number(liquidity[1]);// compute amountY without currentPt
    if (leftPtNum < stateInfo.currentPoint) {
        const rightPt = Math.min(stateInfo.currentPoint, rightPtNum);
        const sqrtPriceR = point2PoolPriceUndecimalSqrt(rightPt);
        const sqrtPriceL = point2PoolPriceUndecimalSqrt(leftPtNum);
        amountY = _getAmountY(liquid, sqrtPriceL, sqrtPriceR, sqrtRate, false);
    }

    // compute amountX without currentPt
    if (rightPtNum > stateInfo.currentPoint + 1) {
        const leftPt = Math.max(stateInfo.currentPoint + 1, leftPtNum);
        const sqrtPriceR = point2PoolPriceUndecimalSqrt(rightPtNum);
        amountX = _getAmountX(liquid, leftPt, rightPtNum, sqrtPriceR, sqrtRate, false);
    }

    // compute amountX and amountY on currentPt
    if (leftPtNum <= stateInfo.currentPoint && rightPtNum > stateInfo.currentPoint) {
        const liquidityValue = liquidity[2]
        const maxLiquidityYAtCurrentPt = stateInfo.liquidity - stateInfo.liquidityX
        const liquidityYAtCurrentPt = liquidityValue > maxLiquidityYAtCurrentPt ? maxLiquidityYAtCurrentPt : liquidityValue;
        const liquidityXAtCurrentPt = liquidityValue - liquidityYAtCurrentPt
        const currentSqrtPrice = point2PoolPriceUndecimalSqrt(stateInfo.currentPoint);
        amountX = amountX+ _liquidity2AmountXAtPoint(liquidityXAtCurrentPt, currentSqrtPrice, false)
        amountY = amountY+ _liquidity2AmountYAtPoint(liquidityYAtCurrentPt, currentSqrtPrice, false)
    }

    return { amountY, amountX };
}

module.exports = {
    getAmounts
};