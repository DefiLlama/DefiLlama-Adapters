const { sumTokensExport } = require('../helper/unwrapLPs')

const config = {
  avax: {
    chaingeAddress: "0xB4623b02A0D9bCf0282600C08E4383c04A0E0AfC",
    tokens: [
      "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7"
    ]
  },
  polygon: {
    chaingeAddress: "0x1e579a1AE5DA042C925902F3Efec1035C9329283",
    tokens: [
      "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"
    ]
  },
  base: {
    chaingeAddress: "0xEcc253aeAeC63bcB2b8eC6A739A0972A817219A3",
    tokens: [
      "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
    ]
  },
  bsc: {
    chaingeAddress: "0x916A6314e9d8E51BEB18b355ad52b4506262620f",
    tokens: [
      "0x55d398326f99059fF775485246999027B3197955"
    ]
  },
  celo: {
    chaingeAddress: "0x65583D94d848E398dE3ef8382e5827000eb99961",
    tokens: [
      "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e"
    ]
  }
}

Object.keys(config).forEach(chain => {
  const { chaingeAddress, tokens } = config[chain]
  module.exports[chain] = {
    tvl: sumTokensExport({ owner: chaingeAddress, tokens })
  }
})
