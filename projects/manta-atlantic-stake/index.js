const { getExports } = require("../helper/heroku-api");

module.exports = {
  timetravel: false,
  ...getExports("manta-atlantic-stake", ["manta_atlantic"]),
};
