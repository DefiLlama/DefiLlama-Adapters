const BigNumber = require('bignumber.js');
const { getReserves } = require('../../../helper/ankr/utils');

const tokenAddresses = require('../constant');

const getWethPrice = async () => {
  const { reserve0, reserve1 } = await getReserves(tokenAddresses.usdWethPair);
  return new BigNumber(reserve1).times(1e12).div(new BigNumber(reserve0))
}

const getOnxPrice = async () => {
  const { reserve0, reserve1 } = await getReserves(tokenAddresses.onxWethSushiPair);
  return new BigNumber(reserve0).div(new BigNumber(reserve1))
}

const getBondPrice = async () => {
  const { reserve0, reserve1 } = await getReserves(tokenAddresses.bondPairEth);
  return new BigNumber(reserve1).div(new BigNumber(reserve0));
}

const getAethPrice = async () => {
  const { reserve0, reserve1 } = await getReserves(tokenAddresses.wethAethPair);
  return new BigNumber(reserve0).div(new BigNumber(reserve1))
}

const getOnePrice = async () => {
  const { reserve0, reserve1 } = await getReserves(tokenAddresses.aethPairOne);
  return new BigNumber(reserve1).div(new BigNumber(reserve0))
}

const getOnsPrice = async () => {
  const { reserve0, reserve1 } = await getReserves(tokenAddresses.aethPairOns);
  return new BigNumber(reserve0).div(new BigNumber(reserve1))
}

const getAnkrPrice = async () => {
  const { reserve0, reserve1 } = await getReserves(tokenAddresses.ankrWethPair);
  return new BigNumber(reserve1).div(new BigNumber(reserve0));
}

const getSushiPrice = async () => {
  const { reserve0, reserve1 } = await getReserves(tokenAddresses.sushiPairEth);
  return new BigNumber(reserve1).div(new BigNumber(reserve0));
}

module.exports = {
  getWethPrice,
  getOnxPrice,
  getBondPrice,
  getAethPrice,
  getOnePrice,
  getOnsPrice,
  getAnkrPrice,
  getSushiPrice,
}