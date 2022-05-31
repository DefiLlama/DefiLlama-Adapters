const utils = require('./utils')

/**
 * @param {number} timestamp - unix timestamp in seconds from epoch of the moment in time for which the balances are requested
 * @param {string} address - the Obyte address of the base AA for which the balances are fetched
 *
 * @return {Promise<object>} the balances of all assets of all AAs that are based on the base AA identified by address
 */
async function fetchBaseAABalances(timestamp, address) {
  /*
   * {
   *   "subject": "GS23D3GQNNMNJ5TL4Z5PINZ5626WASMA",
   *   "addresses": {
   *     "67XYBBBME57DZMJPLOYNXSIMAIDHGUDW": {
   *       "assets": {
   *         "3XF+1slNoFxIVPvRupR5uf9AXluOm92nobzKyCCSE3c=": {
   *           "balance": 829,
   *           "burned": false,
   *           "selfIssued": false,
   *           "selfIssuedUncapped": false
   *         },
   *         "base": {
   *           "balance": 36262,
   *           "burned": false,
   *           "selfIssued": false,
   *           "selfIssuedUncapped": false
   *         }
   *       }
   *     },
   *     "TBLLH5DGDX6KU5UGHG4WDH4N7IC5FPKP": {
   *        ...
   *     },
   *   }
   * }
   */
  const fetched = await utils.fetchURL(` https://api.charts.obyte.app/baseagents/${address}/balances?ts=${timestamp}`)
  return fetched.data
}

/**
 * @return {Promise<object>} fetches all exchange rates traded on Oswap v1 and v2 plus a few externally defined tokens such as GBYTE-USD or BTC-USD
 */
async function fetchOswapExchangeRates() {
  /*
   * {
   *   "BTC_USD": 29832,
   *   "GBYTE_BTC": 0.0004509,
   *   "GBYTE_USD": 13.4512488,
   *   "+X9n1ni9OpH/0PFXdmeB4f16wSxSivW4/qcyOt1UEDI=_USD": 88.2777158012621,
   *   "/1ReF/OW7wud1rqomgWMSeaetx8WjyD6eSTnGurTftU=_USD": 0.22874160911121644
   * }
   */
  const fetched = await utils.fetchURL("https://v2-data.oswap.io/api/v1/exchangeRates")
  return fetched.data
}

/**
 * @return {Promise<object>} fetches assets traded on Oswap v1
 */
async function fetchOswapV1Assets() {
  /*
   * {
   *  "O2-GBYTE-USDC": {
   *    "asset_id": "cQZVAFFh0Aaj5kMMydWoTqcMDxpfzGzEZhhEaQSVbHA=",
   *    "decimals": 0,
   *    "description": "Oswap v2 LP shares GBYTE-USDC",
   *    "symbol": "O2-GBYTE-USDC",
   *    "supply": 5026551
   *  }
   * }
   */
  const fetched = await utils.fetchURL("https://v1-data.oswap.io/api/v1/assets")
  const assets = fetched.data
  return Object.values(assets).reduce((map, asset) => {
    map[asset.asset_id] = asset
    return map
  }, {})
}

/**
 * @return {Promise<object>} fetches assets traded on Oswap v2
 */
async function fetchOswapV2Assets() {
  /*
   * {
   *  "O2-GBYTE-USDC": {
   *    "asset_id": "cQZVAFFh0Aaj5kMMydWoTqcMDxpfzGzEZhhEaQSVbHA=",
   *    "decimals": 0,
   *    "description": "Oswap v2 LP shares GBYTE-USDC",
   *    "symbol": "O2-GBYTE-USDC",
   *    "supply": 5026551
   *  }
   * }
   */
  const fetched = await utils.fetchURL("https://v2-data.oswap.io/api/v1/assets")
  const assets = fetched.data
  return Object.values(assets).reduce((map, asset) => {
    map[asset.asset_id] = asset
    return map
  }, {})
}

async function fetchOswapAssets() {
  const [assets1, assets2] = await Promise.all([
      fetchOswapV1Assets(),
      fetchOswapV2Assets()
  ])
  return {
    ...assets1,
    ...assets2
  }
}

module.exports = {
  fetchBaseAABalances,
  fetchOswapExchangeRates,
  fetchOswapAssets
}
