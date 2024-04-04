const { staking } = require("../helper/staking");

module.exports = {
  arbitrum: {
    tvl: () => ({}),
    staking: staking("0xf75fb73fd1bccd23ce2389169674ce375b43b7a6", "0xe46C5eA6Da584507eAF8dB2F3F57d7F578192e13"),
  },
}
// const { sumTokensExport } = require("../helper/unwrapLPs");
// const ADDRESSES = require("../helper/coreAssets.json");

// const config = {
//   arbitrum: {
//     ownerTokens: [
//       [
//         ["0xe46C5eA6Da584507eAF8dB2F3F57d7F578192e13"],
//         "0xf75fb73fd1bccd23ce2389169674ce375b43b7a6",
//       ],
//     ],
//   },
// };

// Object.keys(config).forEach((chain) => {
//   module.exports[chain] = {
//     tvl: sumTokensExport(config[chain]),
//   };
// });


