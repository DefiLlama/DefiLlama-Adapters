const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { staking } = require('../helper/staking')

const config = {
  ethereum: {
    polk: '0xd478161c952357f05f0292b56012cd8457f1cfbf',
    stakingContracts: [
      "0xfa443f0ec4aed3e87c6d608ecf737a83d950427b", // realitio v1
    ],
    v1: '0xc24a02d81dee67fd52cc95b0d04172032971ea10',
  },
  moonriver: {
    polk: '0x8b29344f368b5fa35595325903fe0eaab70c8e1f',
    stakingContracts: [
      "0x60d7956805ec5a698173def4d0e1ecdefb06cc57", // realitio v1
      "0x9aB1213d360bEa3edA75D88D81D7fbfc9fd37F2b", // realitio v2
    ],
    v1: '0xdcbe79f74c98368141798ea0b7b979b9ba54b026',
    v2: {
      contract: '0x6413734f92248D4B29ae35883290BD93212654Dc',
      tokens: ['0x98878b06940ae243284ca214f92bb71a2b032b8a'],
    },
  },
  moonbeam: {
    polk: '0x8b29344f368b5fa35595325903fe0eaab70c8e1f',
    stakingContracts: [
      "0x83d3f4769a19f1b43337888b0290f5473cf508b2", // realitio v1
      "0xf5872382381cc1a37993d185abb6281fe47f5380", // realitio v2
    ],
    v1: '0x21DFb0a12D77f4e0D2cF9008d0C2643d1e36DA41',
    v2: {
      contract: '0xaaC0068EbE0BFff0FE5E3819af0c46850dC4Cc05',
      tokens: ['0xacc15dc74880c9944775448304b263d191c6077f'],
    },
  },
  polygon: {
    polk: '0x996F19d4b1cE6D5AD72CEaaa53152CEB1B187fD0',
    stakingContracts: [
      "0x83d3f4769a19f1b43337888b0290f5473cf508b2", // realitio v2
    ],
    v2: {
      contract: '0x60d7956805ec5a698173def4d0e1ecdefb06cc57',
      tokens: [ADDRESSES.polygon.WMATIC_2, ADDRESSES.polygon.USDC, ADDRESSES.polygon.USDT],
    },
  },
  xdai: {
    polk: '0x9a2a80c38abb1fdc3cb0fbf94fefe88bef828e00',
    stakingContracts: [
      "0x537dc41fbb4f9faa4b9d6f8e6c2eb9071274f72b", // predictionMarketV3Manager
      "0xBC39fa757886E8A56422Abc460b1FFfc70bbaeC6", // predictionMarketV3Factory
    ],
  },
  celo: {
    polk: '0xb4d8a602fff7790eec3f2c0c1a51a475ee399b2d',
    stakingContracts: [
      "0x1f021be85d6b4d1867c43ef98d30ccc5a44791de", // predictionMarketV3Manager
      "0x0ec82449555efbe9a67cc51de3ef23a56dd79352", // predictionMarketV3Factory
    ],
  }
}

module.exports = {
  methodology:
    "Polkamarkets TVL equals the V1 contracts' EVM balance + V2 contracts tokens balance.\n Polkamarkets staking TVL is the POLK balance of the V1+V2 bonds contracts, plus the POLK balance of V3 predictionMarketManager and predictionMarketFactory contracts.",
}

Object.keys(config).forEach(chain => {
  const { v1, v2, v3, polk = ADDRESSES.null, stakingContracts = [] } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const ownerTokens = []
      if (v1) ownerTokens.push([[ADDRESSES.null], v1])
      if (v2) ownerTokens.push([v2.tokens, v2.contract])
      return sumTokens2({ api, ownerTokens, blacklistedTokens: polk ? [polk] : [] })
    },
    staking: staking(stakingContracts, polk ?? []),
  }
})
