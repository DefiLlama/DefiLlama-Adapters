const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, } = require('../helper/unknownTokens')

module.exports = {
  methodology: 'The total amount of ankrMATIC in the vault', 
  polygon: {
    tvl: sumTokensExport({ chain: 'polygon', owner: '0x5E851dC1f56A05Bb6d3C053FA756304a5171C345', tokens: [
      '0x0E9b89007eEE9c958c0EDA24eF70723C2C93dD58', // ankrMATIC
    ] }),
  },
  ethereum: {
    tvl: sumTokensExport({ chain: 'ethereum', owner: '0x819d1Daa794c1c46B841981b61cC978d95A17b8e', tokens: [
      ADDRESSES.ethereum.WSTETH,
      ADDRESSES.ethereum.RETH,
      '0x9ee91f9f426fa633d227f7a9b000e28b9dfd8599', //stmatic
      ADDRESSES.ethereum.sfrxETH,
    ] }),
  }
}
