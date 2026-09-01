const transformAddress = (chain, address) => {
  switch (chain) {
    case 'polygon': 
      return addr => 'polygon:'+addr
    case 'fantom': 
      return addr => 'fantom:'+addr
    case 'avax': 
      return addr => 'avax:'+addr
    default:
      throw 'Unsupported chain'
  }
}

module.exports = {
  transformAddress
}