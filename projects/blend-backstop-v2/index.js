const { getExports } = require("../helper/heroku-api");

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: `Counts the total amount of BLND-USDC LP shares held by the Blend backstop V2 contract.`,
  ...getExports("blend-backstop-v2", ['stellar'])
};
