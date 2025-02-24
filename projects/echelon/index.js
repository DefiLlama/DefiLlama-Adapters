const sdk = require("@defillama/sdk");
const { getResource, } = require("../helper/chain/aptos");
const { transformBalances } = require("../helper/portedTokens");
const { get } = require("../helper/http");

const mainLendingContract = "0xc6bc659f1649553c1a3fa05d9727433dc03843baac29473c817d06d39e7621ba";
const isolatedLendingContract = "0x5d22fc881144fb4bbaa40b2abf954348082e133fdcd01f7531574df421bde71d";
const coinAssetType = '300';
// main pool

async function getMarketAddresses() {
  const lending = await getResource(mainLendingContract, `${mainLendingContract}::lending::Lending`);
  return lending.market_objects.map(obj => obj.inner);
}

async function getMarket(marketAddress) {
  const market = await getResource(marketAddress, `${mainLendingContract}::lending::Market`)
  var coinInfo = null;
  if (market.asset_type === coinAssetType) {
    coinInfo = (await getResource(marketAddress, `${mainLendingContract}::lending::CoinInfo`)).type_name
  } else {
    coinInfo = (await getResource(marketAddress, `${mainLendingContract}::lending::FungibleAssetInfo`)).metadata.inner; 
  }
  
  
  return { cash: market.total_cash, liability: market.total_liability, fee: market.total_reserve, coin: coinInfo };
}

// isolated pairs

async function getIsolatedPairAddresses() {
  const isolatedLending = await getResource(isolatedLendingContract, `${isolatedLendingContract}::isolated_lending::IsolatedLending`);
  return isolatedLending.pair_objects.map(obj => obj.inner);
}

async function getPair(pairAddress) {
  const [pair, coinInfo] = await Promise.all([
    getResource(pairAddress, `${isolatedLendingContract}::isolated_lending::Pair`),
    getResource(pairAddress, `${isolatedLendingContract}::isolated_lending::CoinInfo`)
  ])
  const { total_collateral_amount, total_supply_amount, total_borrow_amount } = pair;
  const { collateral_type_name, liability_type_name } = coinInfo;
  return { collateral_token: collateral_type_name, asset_token: liability_type_name, total_collateral_amount, total_supply_amount, total_borrow_amount }
}

module.exports = {
  timetravel: false,
  methodology:
    "Aggregate TVL of both the Echelon main pool and its isolated pairs",
  aptos: {
    tvl: async () => {
      const balances = {};

      const marketAddresses = await getMarketAddresses();
      const markets = await Promise.all(marketAddresses.map(marketAddress => getMarket(marketAddress)));
      markets.forEach(({ cash, coin }) => {
        sdk.util.sumSingleBalance(balances, coin, cash);
      });
/* 
      const isolatedPairAddresses = await getIsolatedPairAddresses();
      const pairs = await Promise.all(isolatedPairAddresses.map(pairAddress => getPair(pairAddress)));
      pairs.forEach(({ collateral_token, total_collateral_amount, asset_token, total_supply_amount, total_borrow_amount }) => {
        // isolated pair collateral tvl
        sdk.util.sumSingleBalance(balances, collateral_token, total_collateral_amount);
        // isolated pair asset tvl (supply - borrow)
        sdk.util.sumSingleBalance(balances, asset_token, Number(total_supply_amount) - Number(total_borrow_amount));
      }); */
      
      return transformBalances("aptos", balances);
    },
    borrowed: async () => {
      const balances = {};

      const marketAddresses = await getMarketAddresses();
      const markets = await Promise.all(marketAddresses.map(marketAddress => getMarket(marketAddress)));
      markets.forEach(({ liability, coin }) => {
        sdk.util.sumSingleBalance(balances, coin, liability);
      });

  /*     const isolatedPairAddresses = await getIsolatedPairAddresses();
      const pairs = await Promise.all(isolatedPairAddresses.map(pairAddress => getPair(pairAddress)));
      pairs.forEach(({ asset_token, total_borrow_amount }) => {
        sdk.util.sumSingleBalance(balances, asset_token, total_borrow_amount);
      }); */

      return transformBalances("aptos", balances);
    }
  },
};
