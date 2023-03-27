const BigNumber = require('bignumber.js');
const { ZERO, getTotalSupplyOf, } = require('../../../helper/ankr/utils');
const sdk = require("@defillama/sdk")

const getSymbolPrice = (
  symbol,
  wethPrice,
  onxPrice,
  aEthPrice,
  ankrPrice,
  sushiPrice = ZERO,
  bondPrice = ZERO,
) => {
  if (symbol === 'WETH' || symbol === 'ETH') {
    return wethPrice;
  }
  if (symbol === 'aETHc') {
    return aEthPrice;
  }
  if (symbol === 'ONX') {
    return onxPrice;
  }
  if (symbol === 'ANKR') {
    return ankrPrice;
  }
  if (symbol === 'SUSHI' || symbol === 'xSUSHI' || symbol === 'xSushi') {
    return sushiPrice;
  }
  if (symbol === 'BOND') {
    return bondPrice;
  }
  if (['USDC', 'DAI', 'FRAX'].includes(symbol)) {
    return new BigNumber(1);
  }
  return new BigNumber(0);
};

async function getUsdBalance(
  balance,
  farm,
  wEthPrice,
  onxPrice,
  aEthPrice,
  ankrPrice,
  sushiPrice,
  bondPrice,
) {
  let subSymbol2Decimal = 18;

  if (!farm.isLpToken) {
    return new BigNumber(balance)
      .times(getSymbolPrice(farm.title, wEthPrice, onxPrice, aEthPrice, ankrPrice, sushiPrice, bondPrice))
      .div(1e18);
  } else {
    const totalSupply = await getTotalSupplyOf(farm.address);

    if (!totalSupply.isZero()) {

      const { output: subBalance1 } = await sdk.api.erc20.balanceOf({ target: farm.subTokenAddresses1, owner: farm.address });
      const subSymbol1Price = getSymbolPrice(
        farm.subTokenSymbol1,
        wEthPrice,
        onxPrice,
        aEthPrice,
        ankrPrice,
        sushiPrice,
        bondPrice,
      );

      const { output: subBalance2 } = await sdk.api.erc20.balanceOf({ target: farm.subTokenAddresses2, owner: farm.address });
      const subSymbol2Price = getSymbolPrice(
        farm.subTokenSymbol2,
        wEthPrice,
        onxPrice,
        aEthPrice,
        ankrPrice,
        sushiPrice,
        bondPrice,
      );

      if (farm.subTokenSymbol2 === 'USDC') {
        subSymbol2Decimal = 6;
      }

      const sum = new BigNumber(subBalance1)
        .times(subSymbol1Price)
        .div(1e18)
        .plus(new BigNumber(subBalance2).times(subSymbol2Price).div(new BigNumber(10).pow(subSymbol2Decimal)));

      return BigNumber(balance).times(sum).div(totalSupply);
    } else {
      return ZERO;
    }
  }
}

module.exports = {
  getUsdBalance
}