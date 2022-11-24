const { getUniTVL } = require('../helper/unknownTokens')
const ethers = require("ethers")
const { config } = require('@defillama/sdk/build/api');

config.setProvider("muuchain", new ethers.providers.StaticJsonRpcProvider(
    "https://mainnet-rpc.muuchain.com/",
    {
      name: "muuchain",
      chainId: 20402,
    }
  ))

module.exports = {
  misrepresentedTokens: true,
  muuchain: {
    tvl: getUniTVL({
      factory: '0x058f3f7857d47326021451b6b67c3e92838a6edc', 
      chain: 'muuchain', 
      useDefaultCoreAssets: true,
    })
  },
};

