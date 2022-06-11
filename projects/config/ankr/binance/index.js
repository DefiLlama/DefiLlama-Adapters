const { getBinancePrice } = require("../../../helper/ankr/prices/binance");
const { toUSDTBalances } = require("../../../helper/balances");

const sdk = require("@defillama/sdk")
const tokenAddresses = require('./tokenAddresses');

const getaBNBbTvl = async () => {
  const { output: totalSupply } = await sdk.api.erc20.totalSupply({ target: tokenAddresses.aBNBb, chain: 'bsc' });
  const price = await getBinancePrice("BNBUSDT");
  return toUSDTBalances(totalSupply * price, 1e-12);
};

module.exports = {
  getaBNBbTvl,
};
