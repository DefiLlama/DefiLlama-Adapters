/** 
 * @typedef {Object} ChainConfig
 * @property {`0x${string}`} reader - The reader contract address
 * @property {string} api_url - The api url
 * @property {number} chainId - The chain id
 */

/** @type {Record<string, ChainConfig>} */
const oxiumConfig = {
  sei: {
    reader: "0xfeafb31AC7f09892B50c4d6DA06a1e48D487499E",
    api_url: "https://indexer-sei.mgvinfra.com/",
    chainId: 1329,
  }
}

module.exports = oxiumConfig;