const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport, nullAddress } = require("../helper/unwrapLPs");

// https://docs.ferdyflip.xyz/developers/contracts/platform
const config = {
  avax: {
    tokens: [ADDRESSES.avax.WAVAX, nullAddress], owners: ['0x20AfbaC35B333dA4fE7230CC60946F88ee87aAA3'],
  },
  base: {
    tokens: [ADDRESSES.base.WETH, nullAddress], owners: ['0x3b6014e4b38791444a352D687022D6d6d79Eb99c'],
  },
  mantle: {
    tokens: [ADDRESSES.mantle.WMNT, nullAddress], owners: ['0x559036D9466C93d8Ca3c2232626548e62ceBC07c'],
  },
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    start: 1675962000, //Fri Feb 10 2023
    tvl: sumTokensExport(config[chain]),
  };
});
