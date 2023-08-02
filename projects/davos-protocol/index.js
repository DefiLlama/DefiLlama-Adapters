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
    tvl: sumTokensExport({ chain: 'ethereum', owners: ['0x97f0BdaDbfAA05a1944fFbA862b3336a175056cF', '0xc7b219a9A8e246f9C4d4A1c7d4a371F0840ff724', '0x0730BA2252670Cd71580dadf471f3E137592e800', '0xb396b31599333739A97951b74652c117BE86eE1D', '0x7281d1bCcbe34574Ee6507b3f4816AFBe85A2e3d'], tokens: [
      ADDRESSES.ethereum.WSTETH,
      ADDRESSES.ethereum.RETH,
      '0x9ee91f9f426fa633d227f7a9b000e28b9dfd8599', //stmatic
      ADDRESSES.ethereum.sfrxETH,
      ADDRESSES.ethereum.MATIC
    ] }),
  }
}
