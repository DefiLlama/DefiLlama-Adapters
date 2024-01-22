const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport, nullAddress } = require("../helper/unwrapLPs");

// https://docs.ferdyflip.xyz/developers/contracts/platform
const owners = [
  "0x20AfbaC35B333dA4fE7230CC60946F88ee87aAA3",
  "0x3b6014e4b38791444a352D687022D6d6d79Eb99c",
];

const config = {
  avax: {
    tokens: [ADDRESSES.avax.WAVAX, nullAddress],
  },
  base: {
    tokens: [ADDRESSES.base.WETH, nullAddress],
  },
};

module.exports = {};

Object.keys(config).forEach((chain) => {
  const { tokens } = config[chain];
  module.exports[chain] = {
    tvl: sumTokensExport({ owners, tokens }),
  };
});
