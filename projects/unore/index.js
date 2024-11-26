const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const uno = '0x474021845c4643113458ea4414bdb7fb74a01a77'
const uno_rollux = '0x570baA32dB74279a50491E88D712C957F4C9E409'

const config = {
  ethereum: {
    uToken: uno, // UNO token for staking only
    tokensAndOwners: [
      [nullAddress, '0x929F524473D7B86acc0ADD87B1874Bdf63Cf0Ab1'], // ETH SSIP
      [ADDRESSES.ethereum.USDT, '0x442e9fe958202Dc29d7018c1AA47479F2159D8a0'], // USDT SSIP
      [ADDRESSES.ethereum.USDC, '0xF37c0901662f39039AFBd3c2546e3141c091e014'], // USDC SSIP
    ],
    pools: [
      '0x076E2A501FD0DA41E5A659aB664b2B6792B80Fa2', // UNO SSRP
      '0x8978d08bd89B9415eB08A4D52C1bDDf070F19fA2',  // UNO SSIP
      '0x442e9fe958202Dc29d7018c1AA47479F2159D8a0', // USDT SSIP
      '0xF37c0901662f39039AFBd3c2546e3141c091e014', // USDC SSIP
      '0x929F524473D7B86acc0ADD87B1874Bdf63Cf0Ab1' // ETH SSIP
    ]
  },
  bsc: {
    uToken: uno, // UNO token for staking only
    tokensAndOwners: [
      [ADDRESSES.bsc.USDC, '0xabb83630993984C54fd60650F5A592407C51e54b'], // Zeus V2
    ],
    pools: [
      '0xabb83630993984C54fd60650F5A592407C51e54b', // Zeus V2 
      '0xeF21cB3eE91EcB498146c43D56C2Ef9Bae6B7d53'  // Ares V2
    ]
  },
  rollux: {
    uToken: uno_rollux, // UNO Rollux token for staking only
    tokensAndOwners: [
      [ADDRESSES.optimism.WETH_1, '0x7393310FdC8ed40B35D2afD79848BC7166Ae0474'], // Plutus
    ],
    pools: [
      '0x8685C2b4D2024805a1FF6831Bc4cc8569457811D', // Athena
      '0x7393310FdC8ed40B35D2afD79848BC7166Ae0474' // Plutus
    ]
  }
}

module.exports = {
  start: 1626100000,  // Sep-20-2021 07:27:47 AM +UTC
  kava: { tvl: async () => ({})},
};

Object.keys(config).forEach(chain => {
  const { pools, uToken, tokensAndOwners } = config[chain]

  // TVL (Total Value Locked) - Excludes UNO token
  module.exports[chain] = {
    tvl: async (api) => sumTokens2({ api, tokensAndOwners })
  }
  
  // Staking - Includes only UNO token and its pools
  if (uToken) {
    module.exports[chain].staking = async (api) => sumTokens2({
      api,
      tokens: [uToken],
      owners: pools
    })
  }
})
