// const { sumTokensExport } = require("../helper/unwrapLPs");
// const ADDRESSES = require("../helper/coreAssets.json");

// const config = {
//   arbitrum: {
//     ownerTokens: [
//       [
//         ["0xe46C5eA6Da584507eAF8dB2F3F57d7F578192e13"],
//         "0xbB0390Cf2586e9b0A4FAADF720aE188D140E9fd5",
//       ],
//     ],
//   },
// };

// Object.keys(config).forEach((chain) => {
//   module.exports[chain] = {
//     tvl: sumTokensExport(config[chain]),
//   };
// });

const { staking } = require("./helper/staking");
module.exports = {
  // polygon: {
  //   staking: staking('0xfb06a737f549eb2512eb6082a808fc7f16c0819d'),
  // },
  arbitrum: {
    staking: staking('0xe46C5eA6Da584507eAF8dB2F3F57d7F578192e13'),
  },
};
