const { get } = require('../helper/http')

const APIs = {
  optiondance: "https://api.option.dance/api/v1/statistics/tvl",
};

async function fetch() {
  const resp = await get(APIs.optiondance);
  const tvl = resp.data.total_value;
  return parseFloat(tvl).toFixed(2);
}

module.exports = {
  fetch,
};