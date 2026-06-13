const { sumTokens2 } = require("../helper/unwrapLPs");
const config = require("./config");

module.exports = {
  methodology:
    "Counts as TVL all the Assets deposited on each chain through different Pool Contracts",
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    tvl: async (api) => {
      const toa = [];
      const blacklistedTokens = [];
      Object.values(config[chain]).forEach(
        ({ address, lpToken, poolTokens }) => {
          blacklistedTokens.push(lpToken);
          poolTokens.forEach((i) => toa.push([i, address]));
        }
      );
      return sumTokens2({ tokensAndOwners: toa, api, blacklistedTokens, });
    },
  };
});

module.exports.hallmarks = [
  ['2022-08-26', "JioSwap live, all pools opened for deposits"],
];