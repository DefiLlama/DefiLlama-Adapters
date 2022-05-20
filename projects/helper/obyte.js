const utils = require('./utils')

/**
 * @param {number} timestamp - unix timestamp in seconds from epoch of the moment in time for which the TVL is calculated
 * @param {string} address - the Obyte address of the base AA for which the total TVL is calculated
 *
 * @return the total TVL of all AAs that are based on the base AA identified by address
 */
async function fetchBaseAATvl(timestamp, address) {
  /*
   * Example result:
   * {
   *   "type": "spot",
   *   "series": "tvl",
   *   "subject": "GS23D3GQNNMNJ5TL4Z5PINZ5626WASMA",
   *   "unit": "USD_MA",
   *   "data": {
   *     "2022-05-20T06:16:18.169Z": 8419.285627948508
   *   }
   * }
   */
  const fetched = await utils.fetchURL(` https://api.charts.obyte.app/baseagents/${address}/tvl?ts=${timestamp}`)
  const totalTvlResponse = fetched.data
  return Object.values(totalTvlResponse.data)[0]
}

module.exports = {
  fetchBaseAATvl
}