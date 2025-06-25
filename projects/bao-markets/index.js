const { nullAddress, } = require("../helper/unwrapLPs");
const { compoundExports } = require("../helper/compound");

// BaoMarkets
const comptroller = "0x0Be1fdC1E87127c4fe7C05bAE6437e3cf90Bf8d8";

const compoundTvl = compoundExports(comptroller, '0xf635fdf9b36b557bd281aa02fdfaebec04cd084a', nullAddress, { blacklistedTokens: ['0xe7a52262c1934951207c5fc7a944a82d283c83e5', '0xc0601094C0C88264Ba285fEf0a1b00eF13e79347', ]})

module.exports = {
  ethereum: compoundTvl
};