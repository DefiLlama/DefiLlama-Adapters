const axios = require('axios')
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

module.exports = {
  assetDetails,
  scriptEvaluate,
  data,
};
