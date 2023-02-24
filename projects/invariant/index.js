const { get } = require('../helper/http')

async function fetch() {
  const response = await get("https://stats.invariant.app/short/mainnet");
  return response.tvl;
}

module.exports = {
  timetravel: false,
  fetch,
  methodology: "TVL is a sum of the locked capital in each liquidity pool",
};
