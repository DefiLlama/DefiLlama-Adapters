const { sumTokensExport } = require("../helper/unwrapLPs");

const STAKING_CONTRACT =
  "0xc94320525237422185c498BCae62949839B8330f";

const RECEH =
  "0x4c9C431Fa7fD104c0E7230d20E1623E62019A1C5";

module.exports = {
  bsc: {
    tvl: sumTokensExport({
      owner: STAKING_CONTRACT,
      tokens: [RECEH],
    }),
  },
};
