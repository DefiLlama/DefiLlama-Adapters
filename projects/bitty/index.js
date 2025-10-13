const { tvl, borrowed } = require("./helper");
const methodologies = require("../helper/methodologies");

module.exports = {
  methodology: methodologies.lendingMarket,
  ethereum: {
    tvl,
    borrowed,
  }
};