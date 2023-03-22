const ethers = require("ethers")
const { config } = require('@defillama/sdk/build/api');

config.setProvider("bone", new ethers.providers.StaticJsonRpcProvider(
  "https://rpc.boneriumtech.com",
  {
    name: "bone",
    chainId: 9117,
  }
))

const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  bone: {
    tvl: getUniTVL({ factory: '0x9e98c46825da5f6622eBFA0bc8d278c61b763802', useDefaultCoreAssets: true, })
  }
}