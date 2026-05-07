const { sumTokensExport, nullAddress } = require("../helper/unwrapLPs");

module.exports = {
  arbitrum: {
    tvl: sumTokensExport({
      owner: '0xD4FE46D2533E7d03382ac6cACF0547F336e59DC0',
      tokens: [nullAddress]
    }),
  },
};
