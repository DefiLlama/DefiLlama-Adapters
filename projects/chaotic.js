const { sumTokensExport } = require("./helper/unwrapLPs");

const CollateralSystemAddress = "0x78D4664408c06F2BeDc4f108f3Fc8f0AB017a0AE";

const tokens = {
  CHAOS: "0xf4c6850B6e3288E81Be542909b76865a0BdF9585",
}

module.exports = {
  moonriver: {
    tvl: sumTokensExport({ owner: CollateralSystemAddress, tokens: [tokens.CHAOS]}),
  },
};
