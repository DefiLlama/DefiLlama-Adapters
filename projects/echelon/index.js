const sdk = require("@defillama/sdk");
const { getResource, } = require("../helper/chain/aptos");
const { transformBalances } = require("../helper/portedTokens");

const contractAddress = "0xc6bc659f1649553c1a3fa05d9727433dc03843baac29473c817d06d39e7621ba";

async function getMarketAddresses() {
  const lending = await getResource(contractAddress, `${contractAddress}::lending::Lending`);
  return lending.market_objects.map(obj => obj.inner);
}

async function getMarket(marketAddress) {
  const market = await getResource(marketAddress, `${contractAddress}::lending::Market`);
  const coinInfo = await getResource(marketAddress, `${contractAddress}::lending::CoinInfo`);
  return { cash: market.total_cash, liability: market.total_liability, fee: market.total_reserve, coin: coinInfo.type_name };
}

module.exports = {
  timetravel: false,
  methodology:
    "Aggregates TVL for all markets in Echelon.",
  aptos: {
    tvl: async () => {
      const balances = {};

      const marketAddresses = await getMarketAddresses();
      const markets = await Promise.all(marketAddresses.map(marketAddress => getMarket(marketAddress)));
      markets.forEach(({ cash, coin }) => {
        sdk.util.sumSingleBalance(balances, coin, cash);
      });

      return transformBalances("aptos", balances);
    },
    borrowed: async () => {
      const balances = {};

      const marketAddresses = await getMarketAddresses();
      const markets = await Promise.all(marketAddresses.map(marketAddress => getMarket(marketAddress)));
      markets.forEach(({ liability, coin }) => {
        sdk.util.sumSingleBalance(balances, coin, liability);
      });

      return transformBalances("aptos", balances);
    }
  },
};