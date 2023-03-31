const { tvl } = require("./helper");

module.exports = {
  timetravel: true,
  methodology: `TVL is the total principal of all current offers and taken loans.`,
  solana: {
    tvl,
  },
};
