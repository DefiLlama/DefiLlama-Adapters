const { getExports } = require("../helper/heroku-api");
const methodologies = require("../helper/methodologies");

module.exports = {
  timetravel: false,
  methodology: `${methodologies.lendingMarket}. TVL is calculated and totaled for all Blend V2 pools in the Blend reward zone.`,
  ...getExports("blend-pools-v2", ['stellar'], ['borrowed'])
};
