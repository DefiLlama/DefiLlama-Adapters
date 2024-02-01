const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport, nullAddress } = require("../helper/unwrapLPs");

module.exports.avax = {
  tvl: sumTokensExport({ owners: ["0xab4fe2d136efd7f8dfce3259a5e3c5e4c0130c80"], tokens: [ADDRESSES.avax.WAVAX, nullAddress] }),
};
