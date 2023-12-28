const { default: BigNumber } = require("bignumber.js");


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
    if (!upper) {
        const amount = new BigNumber(liquidity.times(numerator).div(denominator).toFixed(0, 3));
        return amount;
    } else {
        const amount = new BigNumber(liquidity.times(numerator).div(denominator).toFixed(0, 2));
        return amount;
    }
}

function _liquidity2AmountYAtPoint(
    liquidity,
    sqrtPrice,
    upper
) {
    const amountY = liquidity.times(sqrtPrice);
    if (!upper) {
        return new BigNumber(amountY.toFixed(0, 3));
    } else {
        return new BigNumber(amountY.toFixed(0, 2));
    }
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

    if (!upper) {
        const amount = new BigNumber(liquidity.times(numerator).div(denominator).toFixed(0, 3));
        return amount;
    } else {
        const amount = new BigNumber(liquidity.times(numerator).div(denominator).toFixed(0, 2));
        return amount;
    }
}

function _liquidity2AmountXAtPoint(
    liquidity,
    sqrtPrice,
    upper
) {
    const amountX = liquidity.div(sqrtPrice);
    if (!upper) {
        return new BigNumber(amountX.toFixed(0, 3));
    } else {
        return new BigNumber(amountX.toFixed(0, 2));
    }
}

function getAmounts(
    stateInfo,
    liquidity
) {
    let amountX = new BigNumber(0);
    let amountY = new BigNumber(0);
    const liquid = liquidity[2];
    const sqrtRate = Math.sqrt(1.0001);
    const leftPtNum = Number(liquidity[0]);
    const rightPtNum = Number(liquidity[1]);// compute amountY without currentPt
    if (leftPtNum < stateInfo.currentPoint) {
        const rightPt = Math.min(stateInfo.currentPoint, rightPtNum);
        const sqrtPriceR = point2PoolPriceUndecimalSqrt(rightPt);
        const sqrtPriceL = point2PoolPriceUndecimalSqrt(leftPtNum);
        amountY = _getAmountY(new BigNumber(liquid), sqrtPriceL, sqrtPriceR, sqrtRate, false);
    }

    // compute amountX without currentPt
    if (rightPtNum > stateInfo.currentPoint + 1) {
        const leftPt = Math.max(stateInfo.currentPoint + 1, leftPtNum);
        const sqrtPriceR = point2PoolPriceUndecimalSqrt(rightPtNum);
        amountX = _getAmountX(new BigNumber(liquid), leftPt, rightPtNum, sqrtPriceR, sqrtRate, false);
    }

    // compute amountX and amountY on currentPt
    if (leftPtNum <= stateInfo.currentPoint && rightPtNum > stateInfo.currentPoint) {
        const liquidityValue = new BigNumber(liquidity[2]);
        const maxLiquidityYAtCurrentPt = new BigNumber(stateInfo.liquidity).minus(stateInfo.liquidityX);
        const liquidityYAtCurrentPt = liquidityValue.gt(maxLiquidityYAtCurrentPt) ? maxLiquidityYAtCurrentPt : liquidityValue;
        const liquidityXAtCurrentPt = liquidityValue.minus(liquidityYAtCurrentPt);
        const currentSqrtPrice = point2PoolPriceUndecimalSqrt(stateInfo.currentPoint);
        amountX = amountX.plus(_liquidity2AmountXAtPoint(liquidityXAtCurrentPt, currentSqrtPrice, false));
        amountY = amountY.plus(_liquidity2AmountYAtPoint(liquidityYAtCurrentPt, currentSqrtPrice, false));
    }

    return { amountY, amountX };
}

module.exports = {
    point2PoolPriceUndecimalSqrt,
    _getAmountY,
    _liquidity2AmountYAtPoint,
    _getAmountX,
    _liquidity2AmountXAtPoint,
    getAmounts
};