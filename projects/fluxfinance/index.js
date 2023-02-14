const { lendingMarket } = require("../helper/methodologies");
const { compoundExports } = require("../helper/compound");
const { mergeExports } = require("../helper/utils");

const comptroller = "0x95Af143a021DF745bc78e845b54591C53a8B3A51";
const ethereum_markets = [
  {
    fToken: "0x465a5a630482f3abD6d3b84B39B29b07214d19e5",
    underlying: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  },
  {
    fToken: "0xe2bA8693cE7474900A045757fe0efCa900F6530b",
    underlying: "0x6b175474e89094c44da98b954eedeac495271d0f",
  },
  {
    fToken: "0x1dD7950c266fB1be96180a8FDb0591F70200E018",
    underlying: "0x1B19C19393e2d034D8Ff31ff34c81252FcBbee92",
  },
];

function ethereum() {
  const e = ethereum_markets.map((market) => ({
    ethereum: compoundExports(
      comptroller,
      "ethereum",
      market.fToken,
      market.underlying
    ),
  }));

  return mergeExports(e);
}

module.exports = {
  hallmarks: [],
  timetravel: true,
  methodology: `${lendingMarket}. TVL is calculated by getting the market addresses from comptroller and calling the getCash() on-chain method to get the amount of tokens locked in each of these addresses, then we get the price of each token from coingecko.`,
  ...ethereum(),
};
