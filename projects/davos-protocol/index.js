const { sumTokensExport, } = require('../helper/unknownTokens')

module.exports = {
  methodology: 'The total amount of ankrMATIC in the vault', 
  polygon: {
    tvl: sumTokensExport({ chain: 'polygon', owner: '0x5E851dC1f56A05Bb6d3C053FA756304a5171C345', tokens: [
      '0x0E9b89007eEE9c958c0EDA24eF70723C2C93dD58', // ankrMATIC
    ] }),
  }
}
