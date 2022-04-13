const BigNumber = require('bignumber.js');
const { getReserves } = require('../../../helper/ankr/utils');
const { usdtWethPairContract,
  onxWethSushiPairContract,
  aethPairOnsContract,
  aethPairOneContract,
  wethAethPairContract,
  ankrWethPairContract,
  bondPairEthContract,
  sushiPairEthContract } = require('../contract');

const getWethPrice = async () => {
  const { reserve0, reserve1 } = await getReserves(usdtWethPairContract);
  return new BigNumber(reserve1).times(1e12).div(new BigNumber(reserve0))
}

const getOnxPrice = async () => {
  const { reserve0, reserve1 } = await getReserves(onxWethSushiPairContract);
  return new BigNumber(reserve0).div(new BigNumber(reserve1))
}

const getBondPrice = async () => {
  const { reserve0, reserve1 } = await getReserves(bondPairEthContract);
  return new BigNumber(reserve1).div(new BigNumber(reserve0));
}

const getAethPrice = async () => {
  const { reserve0, reserve1 } = await getReserves(wethAethPairContract);
  return new BigNumber(reserve0).div(new BigNumber(reserve1))
}

const getOnePrice = async () => {
  const { reserve0, reserve1 } = await getReserves(aethPairOneContract);
  return new BigNumber(reserve1).div(new BigNumber(reserve0))
}

const getOnsPrice = async () => {
  const { reserve0, reserve1 } = await getReserves(aethPairOnsContract);
  return new BigNumber(reserve0).div(new BigNumber(reserve1))
}

const getAnkrPrice = async () => {
  const { reserve0, reserve1 } = await getReserves(ankrWethPairContract);
  return new BigNumber(reserve1).div(new BigNumber(reserve0));
}

const getSushiPrice = async () => {
  const { reserve0, reserve1 } = await getReserves(sushiPairEthContract);
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