const { get } = require('../helper/http')

const APIs =  "https://api.option.dance/api/v1/statistics/tvl"

async function fetch() {
  const resp = await get(APIs);
  const tvl = resp.data.total_value;
  return parseFloat(tvl).toFixed(2);
}

module.exports = {
  deadFrom: '2025-01-01',
  fetch,
};