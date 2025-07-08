const { lendingMarket } = require("../helper/methodologies");
const { compoundExports, } = require("../helper/compound");

const comptroller = "0x95Af143a021DF745bc78e845b54591C53a8B3A51";

module.exports = {
  methodology: `${lendingMarket}. TVL is calculated by getting the market addresses from comptroller and calling the getCash() on-chain method to get the amount of tokens locked in each of these addresses, then we get the price of each token from coingecko.`,
  ethereum: compoundExports(comptroller),
};
