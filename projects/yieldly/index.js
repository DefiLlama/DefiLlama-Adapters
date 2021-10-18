//const utils = require("../helper/utils");
const axios = require ("axios")
async function tvl() {
  let usdTVL = 0;

  await axios.get("https://data.yieldly.finance/tvl").then((body) => {
    usdTVL = body.data.usdTVL;
  });

  return {
    tvl: usdTVL,
  };
}

module.exports = {
  tvl: tvl,
};
