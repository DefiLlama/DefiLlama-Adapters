const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport, nullAddress } = require("../helper/unwrapLPs");

// https://docs.ferdyflip.xyz/developers/contracts/platform
const config = {
  avax: {
    tokens: [ADDRESSES.avax.WAVAX, nullAddress], owners: ['0xe0a69f4d29c891b9c5c7368b591ed3109bcb80f7'],
  }
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    start: 1675962000, //Fri Feb 10 2023
    tvl: sumTokensExport(config[chain]),
  };
});
