const { getExports } = require("../helper/heroku-api");
const methodologies = require("../helper/methodologies");

module.exports = {
  timetravel: false,
  methodology: `${methodologies.lendingMarket}. TVL is calculated and totaled for all Blend pools in the Blend reward zone.`,
  ...getExports("blend-pools", ['stellar'], ['borrowed'])
};
