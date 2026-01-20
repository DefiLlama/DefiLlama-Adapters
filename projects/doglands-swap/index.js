const { deadFrom } = require("../mosquitos-finance");

module.exports = {
  methodology: "Count TVL as liquidity on the dex",
  misrepresentedTokens: true,
  dogechain: {
    tvl: () => 0
  },
  hallmarks: [
    ['2023-01-20', 'Project rugged'],
  ],
  deadFrom: '2023-01-20'
} 