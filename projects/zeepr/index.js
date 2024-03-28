const { sumTokensExport } = require("../helper/unwrapLPs");
const ADDRESSES = require("../helper/coreAssets.json");

const config = {
  arbitrum: {
    ownerTokens: [
      [
        ["0xe46C5eA6Da584507eAF8dB2F3F57d7F578192e13"],
        "0xbB0390Cf2586e9b0A4FAADF720aE188D140E9fd5",
      ],
    ],
  },
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    tvl: sumTokensExport(config[chain]),
  };
});
