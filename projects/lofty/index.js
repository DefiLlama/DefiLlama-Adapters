
const { toUSDTBalances } = require('../helper/balances');
const axios = require("axios");

const LoftyTVLApi = "https://api.lofty.ai/prod/properties/v2/valuations";

async function loftyTVL() {
  const response = (
        await axios.get(LoftyTVLApi, {
          headers: {
            'X-API-Client': 'DEFILLAMA'
          }
        })
  ).data.data;

  const total = response.reduce((acc, item) => {
    acc = acc + item.propertyPrice.currentInvestment;
    return acc;
  }, 0);

  return toUSDTBalances(total);
}

module.exports = {
  algorand: {
    tvl: loftyTVL,
  }
};

// node test.js projects/lofty/index.js
