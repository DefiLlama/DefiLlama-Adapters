const { getExports } = require("../helper/heroku-api");

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: `Counts the total amount of BLND-USDC LP shares held by the Blend backstop contract. The shares are converted to a USDC value based on the liquidity pool weights.`,
  ...getExports("blend-backstop", ['stellar'])
};
