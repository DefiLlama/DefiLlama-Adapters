const { aBNBbTokenContract } = require("./contracts");
const { getBinancePrice } = require("../../../helper/ankr/prices/binance");
const { toUSDTBalances } = require("../../../helper/balances");

const getaBNBbTvl = async () => {
  const totalSupply = await aBNBbTokenContract.methods.totalSupply().call();
  const price = await getBinancePrice("BNBUSDT");
  return toUSDTBalances(totalSupply * price, 1e-12);
};

module.exports = {
  getaBNBbTvl,
};
