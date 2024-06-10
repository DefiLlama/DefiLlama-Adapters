
const { getExports } = require("../helper/heroku-api");

module.exports = {
  timetravel: false,
  methodology:
    "Total value locked is the total amount of ASTR tokens deposited to the dApp Staking program",
  ...getExports("astar-dapps-staking", ["astar"]),
};