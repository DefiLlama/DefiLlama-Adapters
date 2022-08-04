
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
      coreAssets: [
        '0xd3e822f3ef011Ca5f17D82C956D952D8d7C3A1BB',
        "0x2bF9b864cdc97b08B6D79ad4663e71B8aB65c45c",
        "0x7C598c96D02398d89FbCb9d41Eab3DF0C16F227D",
        "0x922D641a426DcFFaeF11680e5358F34d97d112E1",
      ]
    })
  },
};
