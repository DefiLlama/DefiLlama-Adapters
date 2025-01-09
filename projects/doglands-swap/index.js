const { deadFrom } = require("../mosquitos-finance");

module.exports = {
  methodology: "Count TVL as liquidity on the dex",
  misrepresentedTokens: true,
  dogechain: {
    tvl: () => 0
  },
  hallmarks: [
    [Math.floor(new Date('2023-01-20')/1e3), 'Project rugged'],
  ],
  deadFrom: Math.floor(new Date('2023-01-20')/1e3)
} 