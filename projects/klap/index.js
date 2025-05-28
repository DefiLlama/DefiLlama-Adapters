const { aaveExports } = require("../helper/aave");
const methodologies = require("../helper/methodologies");

module.exports = {
  deadFrom: "2023-09-17",
    methodology: methodologies.lendingMarket,
  klaytn: aaveExports('klaytn', '0x969E4A05c2F3F3029048e7943274eC2E762497AB'),
}

module.exports.klaytn.borrowed = () => ({}) // bad debt
