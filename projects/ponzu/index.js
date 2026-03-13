const { getUniTVL, sumTokensExport } = require("../helper/unknownTokens");

const factories = {
  ethereum: "0x1DCA548D67938E6162f0756985cC3e539Aae30C2",
};

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "TVL is the total liquidity in all PonzuSwap AMM pools, calculated from on-chain reserves via the factory contract.",
  hallmarks: [],
  ethereum: {
    tvl: getUniTVL({
      factory: factories.ethereum,
      useDefaultCoreAssets: true,
    }),
  },
};
