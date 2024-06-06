const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2, nullAddress, } = require('../helper/unwrapLPs')

const ethSSIPEth = '0x29B4b8674D93b36Bf651d0b86A8e5bE3c378aCF4'
const kavaSSIPKava = '0x112a295B0fCd382E47E98E8271e45979EDf952b6'

const config = {
  ethereum: {
    uToken: '0x474021845c4643113458ea4414bdb7fb74a01a77',
    tokensAndOwners: [
      [nullAddress, ethSSIPEth],
      [ADDRESSES.ethereum.USDT, '0x442e9fe958202Dc29d7018c1AA47479F2159D8a0'],
      [ADDRESSES.ethereum.USDC, '0xF37c0901662f39039AFBd3c2546e3141c091e014'],
    ],
    pools: [
      '0x076E2A501FD0DA41E5A659aB664b2B6792B80Fa2', // UNO SSRP
      '0x8978d08bd89B9415eB08A4D52C1bDDf070F19fA2',  // UNO SSIP
      '0x442e9fe958202Dc29d7018c1AA47479F2159D8a0', // USDT SSIP
      '0xF37c0901662f39039AFBd3c2546e3141c091e014' ,// USDC SSIP
    ],
  },
  bsc: {
    uToken: '0x474021845C4643113458ea4414bdb7fB74A01A77',
    tokensAndOwners: [
      [ADDRESSES.bsc.USDC, '0xEcE9f1A3e8bb72b94c4eE072D227b9c9ba4cd750'],
      [ADDRESSES.bsc.USDC, '0x0b5C802ecA88161B5daed08e488C83d819a0cD02'],
      [ADDRESSES.bsc.USDC, '0x2cd32dF1C436f8dE6e09d1A9851945c56bcEd32a'],
      [ADDRESSES.bsc.USDC, '0xabb83630993984C54fd60650F5A592407C51e54b'],
      [ADDRESSES.bsc.USDC, '0xeF21cB3eE91EcB498146c43D56C2Ef9Bae6B7d53'],
    ],
    pools: [
      '0xabb83630993984C54fd60650F5A592407C51e54b', // Zeus V2
      '0xeF21cB3eE91EcB498146c43D56C2Ef9Bae6B7d53' // Ares V2
    ],
  },
  kava: {
    tokensAndOwners: [
      [nullAddress, kavaSSIPKava],
      [ADDRESSES.telos.ETH, '0x6cEC77829F474b56c327655f3281739De112B019'],
    ]
  }
}

module.exports = {
  start: 1626100000,  // Sep-20-2021 07:27:47 AM +UTC
};

Object.keys(config).forEach(chain => {
  const { pools, uToken, tokensAndOwners, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) =>  sumTokens2({api, tokensAndOwners})
  }
  if (uToken)
  module.exports[chain].staking = async (api) =>  sumTokens2({api, tokens: [uToken], owners: pools})
})