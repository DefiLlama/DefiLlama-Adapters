
const sdk = require('@defillama/sdk');
const { toUSDTBalances } = require('../helper/balances');
const retry = require("async-retry");
const axios = require("axios");

const VestaEquityTVLApi = "https://app.vestaequity.net/api/listings/tvl/";

async function vestaequityTVL() {
  const response = (
    await retry(
      async (bail) =>
        await axios.get(VestaEquityTVLApi, {
          headers: {
            'X-API-Client': 'DEFILLAMA'
          }
        })
    )
  ).data;

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
