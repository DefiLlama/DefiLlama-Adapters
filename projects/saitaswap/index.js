const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0x35113a300ca0D7621374890ABFEAC30E88f214b1 on Ethereum & 0x19e5ebc005688466d11015e646fa182621c1881e on BSC) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
    ethereum: {
    tvl: getUniTVL({ factory: '0x35113a300ca0D7621374890ABFEAC30E88f214b1', useDefaultCoreAssets: true }),
  },
  bsc: {
    tvl: getUniTVL({ factory: '0x19e5ebc005688466d11015e646fa182621c1881e', useDefaultCoreAssets: true }),
  },
}; // node test.js projects/saitaswap/index.js