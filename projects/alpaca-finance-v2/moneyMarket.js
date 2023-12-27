const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { getConfig } = require("../helper/cache");
const { sumTokens2 } = require('../helper/unwrapLPs')

async function getMoneyMarketData() {
    return (await getConfig("alpaca-finance-2.0", "https://raw.githubusercontent.com/alpaca-finance/alpaca-v2-money-market/main/.mainnet.json")).moneyMarket;
}

async function lendingTvl(ts, _, _1, {api}) {
  const { moneyMarketDiamond, markets } = await getMoneyMarketData();
  return sumTokens2({ api, owner: moneyMarketDiamond, tokens: markets.map(i => i.token)})
}

async function borrowTvl(ts, _, _1, {api}) {
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
    lendingTvl,
    borrowTvl
}