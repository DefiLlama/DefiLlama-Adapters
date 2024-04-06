const { getUniTVL } = require("../helper/unknownTokens");
const config = {
  manta: "0x7C23F66DFC733068043060ab04f88B5122042E2a",
};

module.exports = {
  misrepresentedTokens: true,
};

Object.keys(config).forEach((chain) => {
  const factory = config[chain];
  module.exports[chain] = {
    tvl: getUniTVL({ factory, useDefaultCoreAssets: true }),
  };
});
