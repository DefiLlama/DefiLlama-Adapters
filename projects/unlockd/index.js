const methodologies = require("../helper/methodologies.js");
const { tvl, borrowed } = require("./helper/index.js");

module.exports = {
    methodology: methodologies.lendingMarket,
    ethereum: {
      tvl,
      borrowed,
    },
};