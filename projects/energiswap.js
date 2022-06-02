const { getUniTVL } = require('./helper/unknownTokens')

const ethers = require("ethers");
const { config } = require("@defillama/sdk/build/api")

config.setProvider(
  "energi",
  new ethers.providers.StaticJsonRpcProvider(
    "https://nodeapi.energi.network",
    {
      name: "energi",
      chainId: 39797,
    }
  )
);

module.exports = {
  energi: {
    tvl: getUniTVL({
      chain: 'energi',
      factory: '0x875aDBaF8109c9CC9AbCC708a42607F573f594E4',
      coreAssets: [
        '0x7A86173daa4fDA903c9A4C0517735a7d34B9EC39', // wnrg
        '0xa55f26319462355474a9f2c8790860776a329aa4', // wnrg
      ]
    }),
  },
}