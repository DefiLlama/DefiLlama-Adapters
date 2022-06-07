const { getBinancePrice } = require("../../../helper/ankr/prices/binance");
const { toUSDTBalances } = require('../../../helper/balances');
const sdk = require("@defillama/sdk")
const tokenAddresses = require('./tokenAddresses');

const getaAVAXbTvl = async () => {
  const { output: totalSupply } = await sdk.api.erc20.totalSupply({ target: tokenAddresses.aAVAXb, chain: 'avax' });
  const price = await getBinancePrice('AVAXUSDT');
  return toUSDTBalances(totalSupply * price, 1e-12);
}

module.exports = {
  getaAVAXbTvl
}