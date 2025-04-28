const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const config = {
  avax: {
    owners: [
      "0xB4623b02A0D9bCf0282600C08E4383c04A0E0AfC",
      "0x29Ff7d778890F40ccE8E74de67D082c0e2DCc1Bc"
    ],
    tokens: [
      ADDRESSES.avax.USDt
    ]
  },
  polygon: {
    owners: [
      "0x1e579a1AE5DA042C925902F3Efec1035C9329283",
      "0x29Ff7d778890F40ccE8E74de67D082c0e2DCc1Bc",
      "0xA4F335B528a24eBDeA10e5CcE14E9750929BBE34"
    ],
    tokens: [
      ADDRESSES.polygon.USDT
    ]
  },
  base: {
    owners: [
      "0xEcc253aeAeC63bcB2b8eC6A739A0972A817219A3",
      "0x29Ff7d778890F40ccE8E74de67D082c0e2DCc1Bc"
    ],
    tokens: [
      ADDRESSES.base.USDC
    ]
  },
  bsc: {
    owners: [
      "0x916A6314e9d8E51BEB18b355ad52b4506262620f",
      "0x29Ff7d778890F40ccE8E74de67D082c0e2DCc1Bc"
    ],
    tokens: [
      ADDRESSES.bsc.USDT
    ]
  },
  celo: {
    owners: [
      "0x65583D94d848E398dE3ef8382e5827000eb99961",
      "0x29Ff7d778890F40ccE8E74de67D082c0e2DCc1Bc"
    ],
    tokens: [
      ADDRESSES.celo.USDT_1
    ]
  }
}

Object.keys(config).forEach(async (chain) => {
  const { owners, tokens } = config[chain]

  module.exports[chain] = {
    tvl: sumTokensExport({ owners: owners, tokens })
  }
});