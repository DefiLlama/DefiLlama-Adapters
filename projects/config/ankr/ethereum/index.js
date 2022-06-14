const coinAddresses = require("../../../helper/ankr/chainAddresses");
const { getBinancePrice } = require("../../../helper/ankr/prices/binance");
const { toUSDTBalances } = require("../../../helper/balances");

const sdk = require("@defillama/sdk")
const tokenAddresses = require('./tokenAddresses');

const getaETHcTvl = async () => {
  const { output: totalSupply } = await sdk.api.erc20.totalSupply({ target: tokenAddresses.aETHc });
  return { [coinAddresses.weth]: totalSupply * 0.93744 };
};

const getaMATICbTvl = async () => {
  const { output: totalSupply } = await sdk.api.erc20.totalSupply({ target: tokenAddresses.aMATICb });
  return { [coinAddresses.matic]: totalSupply };
};

const getaDOTbTvl = async () => {
  const { output: totalSupply } = await sdk.api.erc20.totalSupply({ target: tokenAddresses.aDOTb });
  const price = await getBinancePrice("DOTUSDT");
  return toUSDTBalances(totalSupply * price, 1e-4);
};

const getaKSMbTvl = async () => {
  const { output: totalSupply } = await sdk.api.erc20.totalSupply({ target: tokenAddresses.aKSMb });
  const price = await getBinancePrice("KSMUSDT");
  return toUSDTBalances(totalSupply * price, 1e-6);
};

module.exports = {
  getaETHcTvl,
  getaMATICbTvl,
  getaDOTbTvl,
  getaKSMbTvl,
};
