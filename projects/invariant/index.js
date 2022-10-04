const retry = require("async-retry");
const axios = require("axios");

async function fetch() {
  const response = (
    await retry(
      async () => await axios.get("https://stats.invariant.app/short/mainnet")
    )
  ).data;
  return response.tvl;
}

module.exports = {
  timetravel: false,
  fetch,
  methodology: "TVL is a sum of the locked capital in each liquidity pool",
};
