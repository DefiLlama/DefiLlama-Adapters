
const { getUniTVL } = require('../helper/unknownTokens')
const ethers = require("ethers")
const { config } = require('@defillama/sdk/build/api');

config.setProvider("syscoin", new ethers.providers.StaticJsonRpcProvider(
  "https://rpc.ankr.com/syscoin",
  {
    name: "syscoin",
    chainId: 57,
  }
))

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0x7Bbbb6abaD521dE677aBe089C85b29e3b2021496) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  syscoin: {
    tvl: getUniTVL({
      chain: 'syscoin',
      factory: '0x7Bbbb6abaD521dE677aBe089C85b29e3b2021496',
      useDefaultCoreAssets: true,
    })
  },
};
