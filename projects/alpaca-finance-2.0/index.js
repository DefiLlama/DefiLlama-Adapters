const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { getCache, getConfig } = require("../helper/cache");
const BigNumber = require("bignumber.js");

async function lendingTvl(timestamp, _, _1, {api}) {
  const balances = {};
  const moneyMarket = (await getConfig("alpaca-finance-2.0", "https://raw.githubusercontent.com/alpaca-finance/alpaca-v2-money-market/main/.mainnet.json")).moneyMarket;

  const lendingSupplies = (await sdk.api.abi.multiCall({
    block: api.block,
    chain: api.chain,
    abi: abi.getFloatingBalance,
    calls: moneyMarket.markets.map( (market) => {
      return {
        target: moneyMarket.moneyMarketDiamond,
        params: [market.token]
      }
    }),
  })).output

  for(let i = 0; i < moneyMarket.markets.length; i++) {
    sdk.util.sumSingleBalance(balances,moneyMarket.markets[i].token, lendingSupplies[i].output, api.chain);
  }

  return balances;
}

async function borrowTvl(timestamp, _, _1, {api}) {
  const balances = {};
  const moneyMarket = (await getConfig("alpaca-finance-2.0", "https://raw.githubusercontent.com/alpaca-finance/alpaca-v2-money-market/main/.mainnet.json")).moneyMarket;

  const borrows = (await sdk.api.abi.multiCall({
    block: api.block,
    chain: api.chain,
    abi: abi.getGlobalDebtValueWithPendingInterest,
    calls: moneyMarket.markets.map((market) => {
      return {
        target: moneyMarket.moneyMarketDiamond,
        params: [market.token]
      }
    })
  })).output


  for(let i = 0; i < moneyMarket.markets.length; i++) {
    sdk.util.sumSingleBalance(balances, moneyMarket.markets[i].token, borrows[i].output, api.chain);
  }

  return balances;
}

module.exports = {
    start: 1602054167,
    timetravel: true,
    doublecounted: false,
    methodology: "Sum floating balance and borrow for each token",
    bsc: {
      tvl: lendingTvl,
      borrowed: borrowTvl
    },
  };