const BigNumber = require("bignumber.js");

const Q96 = new BigNumber(2).pow(96);
class V3Utils {
  static getTokenAmounts(
    liquidity,
    sqrtPriceX96,
    tickLow,
    tickHigh,
    Decimal0,
    Decimal1
  ) {
    let sqrtRatioA = Math.sqrt(1.0001 ** tickLow);

    let sqrtRatioB = Math.sqrt(1.0001 ** tickHigh);

    let sqrtPrice = new BigNumber(sqrtPriceX96).div(Q96);

    let currentTick = this._getTickAtSqrtPrice(sqrtPriceX96);

    let amount0 = 0;
    let amount1 = 0;
    if (currentTick < tickLow) {
      amount0 = Math.floor(
        new BigNumber(liquidity)
          .times((sqrtRatioB - sqrtRatioA) / (sqrtRatioA * sqrtRatioB))
          .toNumber()
      );
    } else if (currentTick >= tickHigh) {
      amount1 = Math.floor(
        new BigNumber(liquidity).times(sqrtRatioB - sqrtRatioA).toNumber()
      );
    } else if (currentTick >= tickLow && currentTick < tickHigh) {
      amount0 = Math.floor(
        new BigNumber(liquidity)
          .times((sqrtRatioB - sqrtPrice) / (sqrtPrice * sqrtRatioB))
          .toNumber()
      );
      amount1 = Math.floor(
        new BigNumber(liquidity).times(sqrtPrice - sqrtRatioA).toNumber()
      );
    }

    let amount0Human = (amount0 / 10 ** Decimal0).toFixed(Decimal0);
    let amount1Human = (amount1 / 10 ** Decimal1).toFixed(Decimal1);

    return [amount0, amount1];
  }

  static _getTickAtSqrtPrice(sqrtPriceX96) {
    const _tmpResult = new BigNumber(sqrtPriceX96).div(Q96).pow(2);
    const _result = new BigNumber(_tmpResult).toNumber();
    let tick = Math.floor(Math.log(_result) / Math.log(1.0001));
    return tick;
  }
}

module.exports = {
  V3Utils,
};
