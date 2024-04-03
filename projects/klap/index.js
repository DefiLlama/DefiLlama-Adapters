const { aaveExports } = require("../helper/aave");
const methodologies = require("../helper/methodologies");

module.exports = {
    methodology: methodologies.lendingMarket,
  klaytn: aaveExports('klaytn', '0x969E4A05c2F3F3029048e7943274eC2E762497AB'),
}
