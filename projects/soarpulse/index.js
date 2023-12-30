const { sumTokensExport, nullAddress } = require("../helper/unwrapLPs");

const contract = "0xb29201EBB420b28Bb43052Ad58C23F43d6899F51";

module.exports = {
  pulse: {
    tvl: sumTokensExport({ owner: contract, tokens: [nullAddress]}),
  },
};