const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  misrepresentedTokens: true,
  start: 1686309181,
  era: {
    tvl: getUniTVL({ factory: '0x15C664A62086c06D43E75BB3fddED93008B8cE63', useDefaultCoreAssets: true,}),
  },
};