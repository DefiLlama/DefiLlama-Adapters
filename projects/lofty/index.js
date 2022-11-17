
const sdk = require('@defillama/sdk');
const { toUSDTBalances } = require('../helper/balances');
const retry = require("async-retry");
const axios = require("axios");
const { lookupApplications, } = require("../helper/chain/algorand");

const LoftyTVLApi = "https://api.lofty.ai/prod/properties/v2/valuations";

async function loftyTVL() {
  const response = (
    await retry(
      async (bail) =>
        await axios.get(LoftyTVLApi, {
          headers: {
            'X-API-Client': 'DEFILLAMA'
          }
        })
    )
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
