const { chainTvl } = require("../helper/boringVault");
const { boringVaultsEthereum } = require("./ethereum_constants");
const { boringVaultsV0Fuse } = require("./fuse_constants");

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  start: 1749279179,
  doublecounted: true,
  ["ethereum"]: { tvl: (api) => chainTvl(api, boringVaultsEthereum) },
  ["fuse"]: { tvl: (api) => chainTvl(api, boringVaultsV0Fuse) },
};
