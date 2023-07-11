const { getUniTVL } = require('../helper/unknownTokens')
const ethers = require("ethers")
const { config } = require('@defillama/sdk/build/api');

config.setProvider("ozone", new ethers.providers.StaticJsonRpcProvider("https://node1.ozonechain.io", { name: "ozone", chainId: 4000, }))

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: getUniTVL({ factory: '0xF936CDe5138282eDC6370F9f5ac70d9a1AFC6F78', useDefaultCoreAssets: true }),
  },
  ozone: {
    tvl: getUniTVL({ factory: '0xE6E64C926af9ABEc9D819f52c9572AB961CEF6C1', useDefaultCoreAssets: true }),
  },
}

//https://github.com/lobster-swap
// https://app.lobsterswap.com/
// https://twitter.com/lobster_swap
