// starbank
const retry = require('async-retry')
const {toUSDTBalances} = require("../helper/balances");
const axios = require("axios")

const starbankTVLUrl =
    `https://starbank-storage-api.s3.ap-south-1.amazonaws.com/api/consolidatedDataV1.json?timestamp=${Date.now()}`;

async function tvl() {
  const { data } = await retry(
      async (bail) => await axios.get(starbankTVLUrl)
  );

  return toUSDTBalances(data.totalLiquidity);
}

module.exports = {
    astar:{
        tvl
    }
};
