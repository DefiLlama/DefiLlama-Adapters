const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport, nullAddress } = require("../helper/unwrapLPs");

const owners = [
  "0xA73dA7954834260d7909c697Eb6022e46A5924DE",
  "0xC5d1D50d9517db581DE2Ceb6e5d33B7750b0a04A",
  "0x4c00e75A710E92ea915a865379b07caDf3e6C45e",
];

const config = {
  polygon: {
    tokens: [ADDRESSES.polygon.USDT, nullAddress],
  },
};

module.exports = {};

Object.keys(config).forEach((chain) => {
  const { tokens } = config[chain];
  module.exports[chain] = {
    tvl: sumTokensExport({ owners, tokens }),
  };
});
