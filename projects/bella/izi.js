const { BigNumber } = require("bignumber.js");

const {
  _getAmountX,
  _getAmountY,
  _liquidity2AmountXAtPoint,
  _liquidity2AmountYAtPoint,
  point2PoolPriceUndecimalSqrt,
} = require("./util");

const getLiquidityValue = (
  liquidity,
  leftPoint,
  rightPoint,
  currentPoint,
  currentLiqudity,
  currentLiqudityX
) => {
  let amountX = new BigNumber(0);
  let amountY = new BigNumber(0);
  const liquid = liquidity;
  const sqrtRate = Math.sqrt(1.0001);
  const leftPtNum = Number(leftPoint);
  const rightPtNum = Number(rightPoint);
  // compute amountY without currentPt
  if (leftPtNum < currentPoint) {
    const rightPt = Math.min(currentPoint, rightPtNum);
    const sqrtPriceR = point2PoolPriceUndecimalSqrt(rightPt);
    const sqrtPriceL = point2PoolPriceUndecimalSqrt(leftPtNum);
    amountY = _getAmountY(
      new BigNumber(liquid),
      sqrtPriceL,
      sqrtPriceR,
      sqrtRate,
      false
    );
  }

  // compute amountX without currentPt
  if (rightPtNum > currentPoint + 1) {
    const leftPt = Math.max(currentPoint + 1, leftPtNum);
    const sqrtPriceR = point2PoolPriceUndecimalSqrt(rightPtNum);
    amountX = _getAmountX(
      new BigNumber(liquid),
      leftPt,
      rightPtNum,
      sqrtPriceR,
      sqrtRate,
      false
    );
  }

  // compute amountX and amountY on currentPt
  if (leftPtNum <= currentPoint && rightPtNum > currentPoint) {
    const liquidityValue = new BigNumber(liquidity);
    const maxLiquidityYAtCurrentPt = new BigNumber(currentLiqudity).minus(
      currentLiqudityX
    );
    const liquidityYAtCurrentPt = liquidityValue.gt(maxLiquidityYAtCurrentPt)
      ? maxLiquidityYAtCurrentPt
      : liquidityValue;
    const liquidityXAtCurrentPt = liquidityValue.minus(liquidityYAtCurrentPt);
    const currentSqrtPrice = point2PoolPriceUndecimalSqrt(currentPoint);
    amountX = amountX.plus(
      _liquidity2AmountXAtPoint(liquidityXAtCurrentPt, currentSqrtPrice, false)
    );
    amountY = amountY.plus(
      _liquidity2AmountYAtPoint(liquidityYAtCurrentPt, currentSqrtPrice, false)
    );
  }
  return {
    amountX: amountX.toFixed(0),
    amountY: amountY.toFixed(0),
  };
};

const getPoolLiquidityAmount = (
  miningInfo,
  currentPoint,
  currentLiquidity,
  currentLiquidityX
) => {
  const rangeLen =
    Number(miningInfo.rewardUpperTick_) - Number(miningInfo.rewardLowerTick_);

  const liquidity = new BigNumber(miningInfo.totalVLiquidity_)
    .div(rangeLen)
    .div(rangeLen)
    .times(1e6);

  return getLiquidityValue(
    liquidity.toFixed(0),
    Number(miningInfo.rewardLowerTick_),
    Number(miningInfo.rewardUpperTick_),
    Number(currentPoint),
    currentLiquidity,
    currentLiquidityX
  );
};

module.exports.getPoolLiquidityAmount = getPoolLiquidityAmount;
