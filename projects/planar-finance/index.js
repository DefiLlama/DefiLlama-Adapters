const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  misrepresentedTokens: true,
  start: '2024-05-10',
  blast: {
    tvl: getUniTVL({ factory: '0xdC401B87Ee940F5050f6a17f49763635653eb496', useDefaultCoreAssets: true,}),
  }
};
