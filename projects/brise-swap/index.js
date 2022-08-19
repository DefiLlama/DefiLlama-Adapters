const { getUniTVL } = require('../helper/unknownTokens')
const ethers = require("ethers")
const { config } = require('@defillama/sdk/build/api');

config.setProvider("bitgert", new ethers.providers.StaticJsonRpcProvider(
  "https://chainrpc.com",
  {
    name: "bitgert",
    chainId: 32520,
  }
))

module.exports = {
  misrepresentedTokens: true,
  bitgert: {
    tvl: getUniTVL({
      chain: 'bitgert',
      factory: '0x1379a7f0bfc346d48508B4b162c37a4c43dd89dc',
      useDefaultCoreAssets: true,
    }),
  },
};
