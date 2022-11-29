const TokenMaps = {
  '0x765277eebeca2e31912c9946eae1021199b39c61': ['dai', 18],
  '0x818ec0a7fe18ff94269904fced6ae3dae6d6dc0b': ['usd-coin', 6],
  '0xefaeee334f0fd1712f9a8cc375f427d9cdd40d73': ['tether', 6],
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