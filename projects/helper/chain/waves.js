const axios = require('axios')
const { get } = require('../http')
const { transformBalances } = require('../portedTokens')
const API_HOST = "https://nodes.wavesnodes.com/"; // https://docs.waves.tech/en/waves-node/node-api/#api-of-pool-of-public-nodes

const axiosObj = axios.create({
  baseURL: API_HOST,
  headers: {
    "User-Agent": "defillama",
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

/**
 * Get detailed information about a given asset. [See fields descriptions](https://docs.waves.tech/en/blockchain/token/#custom-token-parameters)
 * @param {string} assetId - Asset ID base58 encoded
 * @returns {{
 *   assetId: string,
 *   issueHeight: number,
 *   issueTimestamp: number,
 *   issuer: string,
 *   issuerPublicKey: string,
 *   name: string,
 *   description: string,
 *   decimals: number,
 *   reissuable: boolean,
 *   quantity: number,
 *   scripted: boolean,
 *   minSponsoredAssetFee: number,
 *   originTransactionId: string
 * }} Asset details
 */
async function assetDetails(assetId) {
  const response = await axiosObj.get(`/assets/details/${assetId}`);
  return response.data;
}

/**
 * Get detailed information about a WAVES. [See fields descriptions](https://docs.waves.tech/en/blockchain/account/account-balance)
 * @param {string} address - Address base58 encoded
 * @returns {{
*   address: string,
*   regular: number,  
*   generating: number,
*   available: number,
*   effective: number
* }} Waves balance details
*/
async function wavesBalanceDetails(address) {
  const response = await axiosObj.get(`/addresses/balance/details/${address}`);
  return response.data;
}

/**
 * Get balance about asset. [See fields descriptions](https://docs.waves.tech/en/blockchain/account/account-balance)
 * @param {string} address - Address base58 encoded
 * @param {string} assetId - assetId base58 encoded
 * @returns {{
*   address: string,
*   assetId: string,  
*   balance: number
* }} Asset balance
*/
async function assetBalance(address, assetId) {
  const response = await axiosObj.get(`/assets/balance/${address}/${assetId}`);
  return response.data;
}


/**
 * Evaluates the provided expression, taking into account the deployed dApp contract
 * @param {string} contract - Address of the deployed dApp contract
 * @returns {{
 *   address: string,
 *   expr: number,
 *   result: { type: string, value: string}
 * }} Evaluated data
 */
async function scriptEvaluate(contract, expr) {
  const response = await axiosObj.post(`/utils/script/evaluate/${contract}`, {
    expr,
  });
  return response.data;
}

/**
 * Read account data entries by a given key
 * @param {string} address - Address base58 encoded
 * @param {string} key - Data key
 * @returns {{
 *   key: string,
 *   type: string,
 *   value: any
 * }} Data value
 */
async function data(address, key) {
  const response = await axiosObj.get(`/addresses/data/${address}/${key}`);
  return response.data;
}

/**
 * Read account data entries by given keys or a regular expression
 * @param {string} address - Address base58 encoded
 * @param {string} matches - Data key
 * @returns {[{
*   key: string,
*   type: string,
*   value: any
* }]} Data values
*/
async function dataSearch(address, matches) {
 const response = await axiosObj.get(`/addresses/data/${address}?matches=${matches}`);
 return response.data;
}

async function sumTokens({ owners, api, includeWaves = true, blacklistedTokens = [] }) {
  blacklistedTokens = new Set(blacklistedTokens)
  await Promise.all(
    owners.map(async (owner) => {
      const { balances } = await get(API_HOST + `assets/balance/${owner}`);
      balances.forEach(({ assetId, balance }) => {
        if (blacklistedTokens.has(assetId)) return;
          api.add(assetId, balance)
      })
    })
  )
  if (includeWaves)
  await Promise.all(
    owners.map(async (owner) => {
      const { balance } = await get(API_HOST + `addresses/balance/${owner}`);
      api.addCGToken('waves', balance / 1e8)
    })
  )
  return transformBalances('waves', api.getBalances())
}

async function call({ target, key}) {
  const { value } = await await get(API_HOST + `addresses/data/${target}/${key}`)
  return value;
}

module.exports = {
  call,
  assetDetails,
  wavesBalanceDetails,
  dataSearch,
  assetBalance,
  scriptEvaluate,
  data,
  sumTokens,
};
