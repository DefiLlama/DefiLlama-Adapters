const { getExports } = require("../helper/heroku-api");

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: `Counts the total amount of BLND-USDC LP shares held by the Blend backstop contract.`,
  ...getExports("blend-backstop", ['stellar'])
};
