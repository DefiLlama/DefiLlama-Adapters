const ADDRESSES = require("../helper/coreAssets.json");
const { getUniTVL, staking } = require("../helper/unknownTokens");
const sdk = require("@defillama/sdk");
const uniTvl = getUniTVL({
  factory: "0xb20a6389cA872d094f3c7A8180fE5BAb431BD794",
  useDefaultCoreAssets: true,
});
const masterchef = "0xcC507803A4b832684154C4E395D92A6EDbEAfE52";
const jade = "0x7c70229F108D3d506Cff8Ea243FFA57344Fc4cE1";
const wmnt = ADDRESSES.mantle.WMNT;

module.exports = {
  misrepresentedTokens: true,
  mantle: {
    tvl: sdk.util.sumChainTvls([
      uniTvl,
      staking({
        owners: [masterchef],
        tokens: [wmnt],
      }),
    ]),
    staking: staking({
      owners: [masterchef],
      tokens: [jade],
    }),
  },
};
