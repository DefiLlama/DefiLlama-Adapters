const utils = require('./helper/utils');
const axios = require("axios");
const retry = require("async-retry");




async function fetch() {
    const totalTvl = await utils.fetchURL('http://validators.narwallets.com:7000/metrics_json')

    const priceNear = await retry(
        async () =>
          await axios.get(
            `https://api.coingecko.com/api/v3/simple/price?ids=near&vs_currencies=usd`
          )
      );

  
  
  return totalTvl.data.tvl * priceNear.data.near.usd;
}

module.exports = {
    methodology: 'TVL counts the NEAR tokens that are staked.',
    fetch,
  }