const { BigNumber } = require("bignumber.js");

const BIG_TEN = new BigNumber(10);

const point2PoolPriceUndecimalSqrt = (point) => {
  return (1.0001 ** point) ** 0.5;
};

const _getAmountX = (
  liquidity,
  leftPt,
  rightPt,
  sqrtPriceR,
  sqrtRate,
  upper
) => {
  const sqrtPricePrPc = Math.pow(sqrtRate, rightPt - leftPt + 1);
  const sqrtPricePrPd = Math.pow(sqrtRate, rightPt + 1);

  const numerator = sqrtPricePrPc - sqrtRate;
  const denominator = sqrtPricePrPd - sqrtPriceR;

  if (!upper) {
    const amount = new BigNumber(
      liquidity.times(numerator).div(denominator).toFixed(0, 3)
    );
    return amount;
  } else {
    const amount = new BigNumber(
      liquidity.times(numerator).div(denominator).toFixed(0, 2)
    );
    return amount;
  }
};

const _getAmountY = (liquidity, sqrtPriceL, sqrtPriceR, sqrtRate, upper) => {
  const numerator = sqrtPriceR - sqrtPriceL;
  const denominator = sqrtRate - 1;
  if (!upper) {
    const amount = new BigNumber(
      liquidity.times(numerator).div(denominator).toFixed(0, 3)
    );
    return amount;
  } else {
    const amount = new BigNumber(
      liquidity.times(numerator).div(denominator).toFixed(0, 2)
    );
    return amount;
  }
};

const _liquidity2AmountXAtPoint = (liquidity, sqrtPrice, upper) => {
  const amountX = liquidity.div(sqrtPrice);
  if (!upper) {
    return new BigNumber(amountX.toFixed(0, 3));
  } else {
    return new BigNumber(amountX.toFixed(0, 2));
  }
};

const _liquidity2AmountYAtPoint = (liquidity, sqrtPrice, upper) => {
  const amountY = liquidity.times(sqrtPrice);
  if (!upper) {
    return new BigNumber(amountY.toFixed(0, 3));
  } else {
    return new BigNumber(amountY.toFixed(0, 2));
  }
};

const amount2Decimal = (amount, tokenDecimal) => {
  return new BigNumber(amount).dividedBy(BIG_TEN.pow(tokenDecimal)).toNumber();
};

module.exports = {
  BIG_TEN,
  amount2Decimal,
  _liquidity2AmountXAtPoint,
  _liquidity2AmountYAtPoint,
  _getAmountY,
  _getAmountX,
  point2PoolPriceUndecimalSqrt,
};
