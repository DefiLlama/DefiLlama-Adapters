const { toUSDTBalances } = require('../helper/balances');
const { get } = require('../helper/http');

const VestaEquityTVLApi = "https://app.vestaequity.net/api/listings/tvl/";

async function vestaequityTVL() {

  const response = (
    await get(VestaEquityTVLApi)
  );

  const total = response.reduce((acc, item) => {
    acc = acc + item.tvl;
    return acc;
  }, 0);

  return toUSDTBalances(total);
}

module.exports = {
  algorand: {
    tvl: vestaequityTVL,
  }
};
