const { getResource, } = require("../helper/chain/aptos");

const aptosLendingContract = "0xc6bc659f1649553c1a3fa05d9727433dc03843baac29473c817d06d39e7621ba";
const movementLendingContract = "0x6a01d5761d43a5b5a0ccbfc42edf2d02c0611464aae99a2ea0e0d4819f0550b5";

const coinAssetType = '300';

async function getMarketAddresses(network) {
  const lendingAddress = network === 'aptos' ? aptosLendingContract : movementLendingContract;
  const lending = await getResource(lendingAddress, `${lendingAddress}::lending::Lending`, network);
  return lending.market_objects.map(obj => obj.inner);
}

async function getMarket(network, marketAddress) {
  const lendingAddress = network === 'aptos' ? aptosLendingContract : movementLendingContract;
  const market = await getResource(marketAddress, `${lendingAddress}::lending::Market`, network)
  var coinInfo = null;
  if (market.asset_type === coinAssetType) {
    coinInfo = (await getResource(marketAddress, `${lendingAddress}::lending::CoinInfo`, network)).type_name
  } else {
    coinInfo = (await getResource(marketAddress, `${lendingAddress}::lending::FungibleAssetInfo`, network)).metadata.inner; 
  }
  
  
  return { cash: market.total_cash, liability: market.total_liability, fee: market.total_reserve, coin: coinInfo };
}

module.exports = {
  timetravel: false,
  methodology:
    "Aggregate TVL of both the Echelon main pool and its isolated pairs",
  aptos: {tvl, borrowed,  },
  move: {tvl, borrowed,  },
};

async function tvl(api) {
  
  const marketAddresses = await getMarketAddresses(api.chain);
  const markets = await Promise.all(marketAddresses.map(marketAddress => getMarket(api.chain, marketAddress)));
  markets.forEach(({ cash, coin }) => {
    api.add(coin, cash);
  });
}

async function borrowed(api) {
  const marketAddresses = await getMarketAddresses(api.chain);
  const markets = await Promise.all(marketAddresses.map(marketAddress => getMarket(api.chain, marketAddress)));
  markets.forEach(({ liability, coin }) => {
    api.add(coin, liability)
  });
}
