const { sumTokensExport } = require("../helper/sumTokens");

module.exports = {
  timetravel: false,
  elrond: {
    tvl: sumTokensExport({
      owner: "erd1qqqqqqqqqqqqqpgqqz6vp9y50ep867vnr296mqf3dduh6guvmvlsu3sujc",
      blacklistedTokens: ['GROK-f2a62f']
    }),
    staking: sumTokensExport({
      owners: ["erd1qqqqqqqqqqqqqpgql9z9vm8d599ya2r9seklpkcas6qmude4mvlsgrj7hv", "erd1qqqqqqqqqqqqqpgq8nlmvjm8gum6y2kqe0v296kgu8cm4jlemvlsays3ku"]
    }),
  },
};
