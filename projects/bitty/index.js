const ethereum = require("./ethereum");
const bitcoin = require("./bitcoin");
const methodologies = require("../helper/methodologies");

module.exports = {
  methodology: methodologies.lendingMarket,
  timetravel: false,
  ethereum,
  bitcoin,
};
