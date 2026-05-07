const { sumTokensExport } = require("../helper/unwrapLPs");

const VAULT = "0x4C18Ff3C89632c3Dd62E796c0aFA5c07c4c1B2b3";
const FXRP = "0xad552a648c74d49e10027ab8a618a3ad4901c5be";

module.exports = {
  flare: {
    tvl: sumTokensExport({ owner: VAULT, tokens: [FXRP] }),
  },
  methodology: "Counts FXRP tokens held in the Firelight vault.",
};
