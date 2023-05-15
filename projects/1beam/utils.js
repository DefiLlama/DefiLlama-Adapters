const ADDRESSES = require('../helper/coreAssets.json')
const TokenMaps = {
  [ADDRESSES.shiden.ETH]: ['dai', 18],
  [ADDRESSES.telos.USDC]: ['usd-coin', 6],
  [ADDRESSES.telos.USDT]: ['tether', 6],
  '0xa649325aa7c5093d12d6f98eb4378deae68ce23f': ['binance-usd', 18]
}

/**
 * 
 * @param {string} address token address in lower case
 * @returns coingecko id and decimals
 */
function getTokenId(address) {
  return TokenMaps[address]
}

module.exports = {
  getTokenId
}