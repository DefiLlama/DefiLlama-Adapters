const utils = require("../helper/utils");

const api_ergo = "https://api.ergodex.io/v1/amm/platform/stats?";

async function fetch() {
  const data = (await utils.fetchURL(api_ergo)).data.tvl;
  return data.value / 10 ** data.units.currency.decimals;
}

module.exports = {
  fetch,
};
