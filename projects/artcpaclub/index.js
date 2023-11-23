const { sumTokens } = require("../helper/chain/elrond");

async function tvl() {
  const owners = [
    "erd1qqqqqqqqqqqqqpgqfken0exk7jpr85dx6f8ym3jgcagesfcqkqys0xnquf",
    "erd1qqqqqqqqqqqqqpgqj8exjpz38agu78sxh5rlxcp2kmxy35m6kqysscypf3",
  ];
  return sumTokens({ owners });
}

module.exports = {
  timetravel: false,
  elrond: {
    tvl,
  },
};
