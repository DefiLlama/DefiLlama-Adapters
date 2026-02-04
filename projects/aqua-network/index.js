const { get } = require('../helper/http')
const AQUA_STATS_URL = "https://amm-api.aqua.network/api/external/v1/statistics/totals/?size=all"

let _data

async function getData() {
  if (!_data)
    _data = get(AQUA_STATS_URL)
  const data = await _data
  const res = {}
  data.forEach((item) => {
    res[item.date] = item.tvl / 1e7
  })
  return res
}

function formatUnixTimestamp(unixTimestamp) {
  const date = new Date(unixTimestamp * 1000); // Convert Unix timestamp to milliseconds
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function tvl(api) {
  const key = formatUnixTimestamp(api.timestamp)
  const allData = await getData()
  const usdValue = allData[key]
  if (!usdValue)
    throw new Error('No data found for current date');
  api.addCGToken('tether', usdValue)
}

module.exports = {
  start: '2024-07-01',
  misrepresentedTokens: true,
  methodology:
    'counts the liquidity of the Pools on AMM, data is pulled from the Aquarius API.',
  stellar: { tvl },
};
