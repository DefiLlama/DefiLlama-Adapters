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
 * A reducer applied on a list of response objects returned by fetchBaseAABalances() to calculate the total.
 * This reducer excludes locked in assets that were issued by the same autonomous agent.
 *
 * @example
 *   const balancesV1 = wait fetchBaseAABalances(timestamp, 'GS23D3GQNNMNJ5TL4Z5PINZ5626WASMA')
 *   const balancesV2 = wait fetchBaseAABalances(timestamp, '2JYYNOSRFGLI3TBI4FVSE6GFBUAZTTI3')
 *   const tvl = [balancesV1, balancesV2].reduce(summingBaseAABalancesToTvl(assetMetadata, exchangeRates), 0)
 *
 * @param {object} assetMetadata asset metadata (eg. decimals) mapped to the asset id (asset unit hash)
 * @param {object} exchangeRates asset/USD exchange rates mapped to assetId_USD keys
 * @return {function(number, object)} reducer function to be used with Array.reduce() where each element in the array is
 *    a result of a fetchBaseAABalances() call
 */
function summingBaseAABalancesToTvl(assetMetadata, exchangeRates) {

  const summingAssetTvl = (total, [asset, assetDetails]) => {
    if (!assetMetadata?.hasOwnProperty(asset)) return total

    const decimals = assetMetadata[asset].decimals ?? 0
    const baseCurrency = (asset === "base") ? "GBYTE" : asset
    const usdRate = exchangeRates[`${baseCurrency}_USD`] ?? 0
    const usdValue = assetDetails.balance / Math.pow(10, decimals) * usdRate
    // console.log(`  ${assetMetadata[asset]?.symbol ?? asset} = ${usdValue.toFixed(2)}`)
    return total + usdValue
  }

  const summingAddressTvl = (total, [address, addressDetails]) => {
    // console.log(`${address}:`)
    return total + Object.entries(addressDetails.assets)
        .filter(([asset, assetDetails]) => !assetDetails.selfIssued)
        .reduce(summingAssetTvl, 0)
  }

  const summingBaseAATvl = (total, balances) => {
    return total + Object.entries(balances.addresses).reduce(summingAddressTvl, 0)
  }

  return summingBaseAATvl
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
  fetchOswapAssets,
  summingBaseAABalancesToTvl
}
