const { aAVAXbTokenContract } = require('./contracts');
const { getBinancePrice } = require("../../../helper/ankr/prices/binance");
const { toUSDTBalances } = require('../../../helper/balances');

const getaAVAXbTvl = async () => {
  const totalSupply = await aAVAXbTokenContract.methods.totalSupply().call();
  const price = await getBinancePrice('AVAXUSDT');
  return toUSDTBalances(totalSupply * price, 1e-12);
}

module.exports = {
  getaAVAXbTvl
}