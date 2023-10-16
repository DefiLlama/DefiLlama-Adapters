const { getUniTVL } = require("../helper/unknownTokens");
module.exports = {
  misrepresentedTokens: true,
  manta: {
    tvl: getUniTVL({
      factory: "0x19405689008954ccddbc8c7ef2b64dd88b4a674a",
      useDefaultCoreAssets: true,
      fromBlock: 247425,
    }),
  },
};
