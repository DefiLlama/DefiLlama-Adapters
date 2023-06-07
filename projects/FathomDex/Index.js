const { getUniTVL } = require("../helper/unknownTokens");

const chain = "XDC Network ";

module.exports = {
  misrepresentedTokens: true,
  XDC Network: {
    tvl: getUniTVL({
      chain,
      factory: "0x9fAb572F75008A42c6aF80b36Ab20C76a38ABc4B",
      useDefaultCoreAssets: true,
    }),
  },
};