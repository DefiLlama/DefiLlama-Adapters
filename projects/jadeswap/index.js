const ADDRESSES = require("../helper/coreAssets.json");
const { getUniTVL, staking } = require("../helper/unknownTokens");
const sdk = require("@defillama/sdk");
const uniTvl = getUniTVL({
  factory: "0x210D0c3d885C5D296e8F32Ad4B7a9a2Fe39E983b",
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
