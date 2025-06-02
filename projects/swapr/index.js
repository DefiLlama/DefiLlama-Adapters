const { getUniTVL } = require("../helper/unknownTokens");

const FACTORY_ADDRESS = Object.freeze({
  ethereum: "0xd34971BaB6E5E356fd250715F5dE0492BB070452",
  xdai: "0x5d48c95adffd4b40c1aaadc4e08fc44117e02179",
  arbitrum: "0x359f20ad0f42d75a5077e65f30274cabe6f4f01a",
});

module.exports = {
  misrepresentedTokens: true,
};

Object.keys(FACTORY_ADDRESS).forEach(chain => {
  const factory = FACTORY_ADDRESS[chain]
  module.exports[chain] = {
    tvl: getUniTVL({ chain, useDefaultCoreAssets: true, factory })
  }
})
