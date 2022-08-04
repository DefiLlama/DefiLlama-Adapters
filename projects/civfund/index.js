const { toUSDTBalances } = require('../helper/balances');
const axios = require("axios");


const CivFundTVLApi = "https://dev-api.civfund.org/getTotalTVL/1";

async function civFundTVL() {

  const response = (
    await axios.get(CivFundTVLApi, {
      headers: {
        'X-API-Client': 'DEFILLAMA'
      }
    })
  );
  return toUSDTBalances(response.data.totalTVL);
}

module.exports = {
  algorand: {
    tvl: civFundTVL,
  }
};
