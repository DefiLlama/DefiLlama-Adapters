const {
  aETHcTokenContract,
  aMATICbTokenContract,
  aDOTbTokenContract,
  aKSMbTokenContract,
} = require("./contracts");
const coinAddresses = require("../../../helper/ankr/chainAddresses");
const { getBinancePrice } = require("../../../helper/ankr/prices/binance");
const { toUSDTBalances } = require("../../../helper/balances");

const getaETHcTvl = async () => {
  const totalSupply = await aETHcTokenContract.methods.totalSupply().call();
  return { [coinAddresses.weth]: totalSupply * 0.93744 };
};

const getaMATICbTvl = async () => {
  const totalSupply = await aMATICbTokenContract.methods.totalSupply().call();
  return { [coinAddresses.matic]: totalSupply };
};

const getaDOTbTvl = async () => {
  const totalSupply = await aDOTbTokenContract.methods.totalSupply().call();
  const price = await getBinancePrice("DOTUSDT");
  return toUSDTBalances(totalSupply * price, 1e-4);
};

const getaKSMbTvl = async () => {
  const totalSupply = await aKSMbTokenContract.methods.totalSupply().call();
  const price = await getBinancePrice("KSMUSDT");
  return toUSDTBalances(totalSupply * price, 1e-6);
};

module.exports = {
  getaETHcTvl,
  getaMATICbTvl,
  getaDOTbTvl,
  getaKSMbTvl,
};
