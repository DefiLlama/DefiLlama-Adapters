const { getUniTVL } = require('../helper/unknownTokens')
const ethers = require("ethers")
const { config } = require('@defillama/sdk/build/api');

config.setProvider("dogechain", new ethers.providers.StaticJsonRpcProvider(
  "https://rpc.dogechain.dog",
  {
    name: "dogechain",
    chainId: 2000,
  }
))

module.exports = {
  misrepresentedTokens: true,
  dogechain: {
    tvl: getUniTVL({
      chain: 'dogechain',
      useDefaultCoreAssets: true,
      factory: '0xD27D9d61590874Bf9ee2a19b27E265399929C9C3',
    })
  }
}