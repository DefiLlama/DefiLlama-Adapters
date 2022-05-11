const BigNumber = require('bignumber.js');
const { ZERO, getTotalSupplyOf, getBalanceOf } = require('../../../helper/ankr/utils');;
const ERC20Abi = require('../../../helper/ankr/abis/ERC20.json');
const web3 = require('../../web3.js');

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
    const totalSupply = await getTotalSupplyOf(farm.contract);

    if (!totalSupply.isZero()) {
      const subTokenContract1 = new web3.eth.Contract(ERC20Abi, farm.subTokenAddresses1);
      const subTokenContract2 = new web3.eth.Contract(ERC20Abi, farm.subTokenAddresses2);

      const subBalance1 = await getBalanceOf(farm.address, subTokenContract1);
      const subSymbol1Price = getSymbolPrice(
        farm.subTokenSymbol1,
        wEthPrice,
        onxPrice,
        aEthPrice,
        ankrPrice,
        sushiPrice,
        bondPrice,
      );

      const subBalance2 = await getBalanceOf(farm.address, subTokenContract2);
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