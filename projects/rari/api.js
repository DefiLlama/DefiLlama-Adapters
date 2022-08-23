const { get } = require("../helper/http");

async function fetch() {
  const { tvl } = await get("https://app.rari.capital/api/stats")

  return parseFloat(tvl);
}

module.exports = {
  fetch,
};
