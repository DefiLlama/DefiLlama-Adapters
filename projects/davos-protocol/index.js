const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, } = require('../helper/unknownTokens')

module.exports = {
  methodology: 'The total amount of ankrMATIC in the vault', 
  polygon: {
    tvl: sumTokensExport({ owner: '0x5E851dC1f56A05Bb6d3C053FA756304a5171C345', tokens: [
      '0x0E9b89007eEE9c958c0EDA24eF70723C2C93dD58', // ankrMATIC
    ] }),
  },
  ethereum: {
    tvl: sumTokensExport({ owners: ['0x97f0BdaDbfAA05a1944fFbA862b3336a175056cF', '0xc7b219a9A8e246f9C4d4A1c7d4a371F0840ff724', '0x0730BA2252670Cd71580dadf471f3E137592e800', '0xb396b31599333739A97951b74652c117BE86eE1D', '0x7281d1bCcbe34574Ee6507b3f4816AFBe85A2e3d'], tokens: [
      ADDRESSES.ethereum.WSTETH,
      ADDRESSES.ethereum.RETH,
      '0x9ee91f9f426fa633d227f7a9b000e28b9dfd8599', //stmatic
      ADDRESSES.ethereum.sfrxETH,
      ADDRESSES.ethereum.MATIC
    ] }),
  },
  arbitrum: {
    tvl: sumTokensExport({ owners: ['0x9eDC0ea75e6023b93bbB41c16818e314cfE59D2b', '0x30aCD3e86f42Fcc87c6FB9873058d8d7133785d4' ], tokens: [
      "0xEC70Dcb4A1EFa46b8F2D97C310C9c4790ba5ffA8", //RETH
      ADDRESSES.arbitrum.WSTETH
    ] }),
  },
  bsc: {
    tvl: sumTokensExport({ owner: '0x4e90156997BB469c6F5975e13FF1451C9500B711', tokens: [
      "0x52F24a5e03aee338Da5fd9Df68D2b6FAe1178827"
    ] }),
  },
  optimism: {
    tvl: sumTokensExport({ owner: '0x9c44E6A927302dA33dd76abe4558f26e31C48019', tokens: [
      "0x9Bcef72be871e61ED4fBbc7630889beE758eb81D" //RETH
    ] }),
  },
}
