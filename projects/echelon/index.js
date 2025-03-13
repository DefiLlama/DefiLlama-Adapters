const { getResource, } = require("../helper/chain/aptos");

const mainLendingContract = "0xc6bc659f1649553c1a3fa05d9727433dc03843baac29473c817d06d39e7621ba";
const coinAssetType = '300';
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

module.exports = {
  timetravel: false,
  methodology:
    "Aggregate TVL of both the Echelon main pool and its isolated pairs",
  aptos: {
    tvl: async (api) => {
      const marketAddresses = await getMarketAddresses();
      const markets = await Promise.all(marketAddresses.map(marketAddress => getMarket(marketAddress)));
      markets.forEach(({ cash, coin }) => {
        api.add(coin, cash);
      });
    }
  },
};
