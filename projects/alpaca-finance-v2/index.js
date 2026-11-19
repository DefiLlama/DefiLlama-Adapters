const abi = {
    "getFloatingBalance": "function getFloatingBalance(address _token) external view returns (uint256 _floating)",
    "getGlobalDebtValueWithPendingInterest": "function getGlobalDebtValueWithPendingInterest(address _token) external view returns (uint256)"
};
const { getConfig } = require("../helper/cache");
const { sumTokens2 } = require('../helper/unwrapLPs')

async function getMoneyMarketData() {
    return (await getConfig("alpaca-finance-2.0", "https://raw.githubusercontent.com/alpaca-finance/alpaca-v2-money-market/main/.mainnet.json")).moneyMarket;
}

async function lendingTvl(api) {
  const { moneyMarketDiamond, markets } = await getMoneyMarketData();
  return sumTokens2({ api, owner: moneyMarketDiamond, tokens: markets.map(i => i.token)})
}

async function borrowTvl(api) {
  const  { moneyMarketDiamond, markets } = await getMoneyMarketData();
  const tokens = markets.map(i => i.token)

  const borrows = (await api.multiCall({
    abi: abi.getGlobalDebtValueWithPendingInterest,
    target: moneyMarketDiamond,
    calls: tokens
  }))
  api.addTokens(tokens, borrows)
}

module.exports = {
  start: '2020-10-07',
  methodology: "Sum floating balance and borrow for each token",
  bsc: {
    tvl: lendingTvl,
    borrowed: borrowTvl
  },
};