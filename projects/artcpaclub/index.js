const { sumTokens, sumTokensExport } = require("../helper/chain/elrond");
const owners = [
  "erd1qqqqqqqqqqqqqpgqfken0exk7jpr85dx6f8ym3jgcagesfcqkqys0xnquf",
  "erd1qqqqqqqqqqqqqpgqj8exjpz38agu78sxh5rlxcp2kmxy35m6kqysscypf3",
];

const CPA = 'CPA-97530a'

module.exports = {
  timetravel: false,
  elrond: {
    tvl: sumTokensExport({ owners, blacklistedTokens: [CPA]}),
    staking: sumTokensExport({ owners, tokens: [CPA]}),
  },
};
