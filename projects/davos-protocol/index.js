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
      '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0', // WSTETH
      '0xae78736cd615f374d3085123a210448e74fc6393', //reth
      '0x9ee91f9f426fa633d227f7a9b000e28b9dfd8599', //stmatic
      '0xac3e018457b222d93114458476f3e3416abbe38f', //SFRXETH
    ] }),
  }
}
