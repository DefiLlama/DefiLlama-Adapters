const { transformFantomAddress, transformAvaxAddress, transformPolygonAddress } = require("../helper/portedTokens");

const transformAddress = (chain, address) => {
  switch (chain) {
    case 'polygon': 
      return Promise.resolve(address => `polygon:${address}`)
    case 'fantom': 
      return transformFantomAddress()
    case 'avax': 
      return transformAvaxAddress()
    default:
      throw 'Unsupported chain'
  }
}

module.exports = {
  transformAddress
}