const { tvl } = require("./tvl");

module.exports = {
  methodology:
    "Counts all TON sitting in pre-bonding and high-load smart contact as the TVL. ",
  timetravel: false,
  misrepresentedTokens: true,
  ton: {
    tvl,
  },
};
