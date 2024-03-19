const axios = require('axios')
const { get } = require('../http')
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

const tokenMapping = {
  'WAVES':  { cgId: 'waves', decimals: 8 },
  '3VuV5WTmDz47Dmdn3QpcYjzbSdipjQE4JMdNe1xZpX13': { cgId: 'ethereum', decimals: 8 },
  '2Fge5HEBRD3XTeg7Xg3FW5yiB9HVJFQtMXiWMQo72Up6': { cgId: 'wrapped-bitcoin', decimals: 8 },
  '66a1br3BrkoaJgP7yEar9hJcSTvJPoH6PYBLqscXcMGo': { cgId: 'binancecoin', decimals: 8 }, 
  'QGDb5VHmjUMfHPAvRJ4g36nmU5qYByYyYzReJN71nad': { cgId: 'chainlink', decimals: 8 }, 
  '2x8CpnEDNw2nsuyvEptEmEbVrkxh9regRDNrqTWThJTZ': { cgId: 'maker', decimals: 8 }, 
  '78ePJGDo2H6cZUDYsAMzqxe2iSRNgz4QBnYYg58ZxdgH': { cgId: 'uniswap', decimals: 8 }, 
  'AhGJvjtYmRG2pKwXvTh8N6sX1M2wNTpkjxaWKQfzJe7q': { cgId: 'matic-network', decimals: 8 }, 
  'EW1uGLVo21Wd9i2Rhq8o4VKDTCQTGCGXE8DqayHGrLg8': { cgId: 'binance-bitcoin', decimals: 8 }, 
  'FmsB2B21fVVetWvZm7Q48cC2Bvs2hEZtft49TBn3guV1': { cgId: 'curve-dao-token', decimals: 8 }, 
  '5Ga8eJdR5PoBWLC2xaq6F6PAGCM5hWVNhuyycgsNn4jR': { cgId: 'crvusd', decimals: 6 }, 
  'Fwvk46RZ4iBg4L9GzwjQ7jwVsEScn4aPD32V6wftTLHQ': { cgId: 'tron', decimals: 6 }, 

  'G5WWWzzVsWRyzGf32xojbnfp7gXbWrgqJT8RcVWEfLmC': { cgId: 'tether', decimals: 6, name: 'USDT-PPT' },
  '9wc3LXNA4TEBsXyKtoLE9mrbDD7WMHXvXrCjZvabLAsi': { cgId: 'tether', decimals: 6, name: 'USDT-ERC20' },
  'A81p1LTRyoq2rDR2TNxB2dWYxsiNwCSSi8sXef2SEkwb': { cgId: 'tether', decimals: 6, name: 'USDT-BEP20' },
  'DaErMEp76HtuvbbSYxDwLovRimaAwtEyQGFeHLQ3UWwh': { cgId: 'tether', decimals: 6, name: 'USDT-TRC20' },
  'Cu6FRaNphvp1iwmnyVRAvcnyVgLEwBGwSvGQrVsThAAD': { cgId: 'tether', decimals: 6, name: 'USDT-POLY' },

  '3ayH3PhWMkhFsySsUVcC8BvFf1QyxGB5BZuTPyVtmP4v': { cgId: 'usd-coin', decimals: 6, name: 'USDC-PPT' }, 
  'HGgabTqUS8WtVFUJzfmrTDMgEccJuZLBPhFgQFxvnsoW': { cgId: 'usd-coin', decimals: 6, name: 'USDC-ERC20' }, 
  '4BKKSp6NoNcrFHyorZogDyctq1fq6w7114Ym1pw6HUtC': { cgId: 'usd-coin', decimals: 6, name: 'USDC-BEP20' }, 
  'EMGARezYjWYMvaU795eQK4jzrDZhCfdREAYXGb8UeDk1': { cgId: 'usd-coin', decimals: 6, name: 'USDC-TRC20' }, 
  '791Q1EcmnUAwRBqck7SyPbowktToCTKARsmBju4XQKd2': { cgId: 'usd-coin', decimals: 6, name: 'USDT-POLY' }, 

  'C1iWsKGqLwjHUndiQ7iXpdmPum9PeCDFfyXBdJJosDRS': { cgId: 'waves-ducks', decimals: 8 },
  'DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p': { cgId: 'neutrino', decimals: 6 },
  'GAzAEjApmjMYZKPzri2g2VUXNvTiQGF7KDYZFFsP3AEq': { cgId: 'pete', decimals: 8 },
  'Atqv59EYzjFGuitKVnMRk6H8FukjoV3ktPorbEys25on': { cgId: 'waves-exchange', decimals: 8 },
  '2thsACuHmzDMuNezPM32wg9a3BwUzBWDeSKakgz3cw21': { cgId: 'power-token', decimals: 8 },
  '4LHHvYGNKJUg5hj65aGD5vgScvCBmLpdRFtjokvCjSL8': { cgId: 'waves-enterprise', decimals: 8 },
  '6nSpVyNH7yM69eg446wrQR94ipbbcmZMU1ENPwanC97g': { cgId: 'neutrino-system-base-token', decimals: 6 },
  'HEB8Qaw9xrWpWs8tHsiATYGBWDBtP2S7kcPALrMu43AS': { cgId: 'puzzle-swap', decimals: 8 },
  'Ehie5xYpeN8op1Cctc6aGUrqx8jq3jtf1DSjXDbfm7aT': { cgId: 'swop', decimals: 8 },
}

async function sumTokens({ owners, api, includeWaves = true, blacklistedTokens = [] }) {
  blacklistedTokens = new Set(blacklistedTokens)
  await Promise.all(
    owners.map(async (owner) => {
      const { balances } = await get(API_HOST + `assets/balance/${owner}`);
      balances.forEach(({ assetId, balance }) => {
        if (blacklistedTokens.has(assetId)) return;
        if (tokenMapping[assetId]) {
          const { cgId, decimals } = tokenMapping[assetId]
          api.addCGToken(cgId, balance / (10 ** decimals))
        } else {
          api.add(assetId, balance)
        }
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
}

async function call({ target, key}) {
  const { value } = await await get(API_HOST + `addresses/data/${target}/${key}`)
  return value;
}

/**
* Map known Waves assets to Coin Geco Id
* @param {string} assetId - AssetId base58 encoded
* @returns {{
*   cgId: string,
*   decimals: number,
* }} Data values
*/
function mapAssetIdToCG(assetId) {
  return tokenMapping[assetId] || null;
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
  mapAssetIdToCG
};
