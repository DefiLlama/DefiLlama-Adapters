const { getResource, } = require("../helper/chain/aptos");
const http = require("../helper/http");

const aptosLendingContract = "0xc6bc659f1649553c1a3fa05d9727433dc03843baac29473c817d06d39e7621ba";
const movementLendingContract = "0x6a01d5761d43a5b5a0ccbfc42edf2d02c0611464aae99a2ea0e0d4819f0550b5";
const echelonChainLendingContract = "0xedcdbb4c459064293924e0e96e01d5927faa11fd38d331111d99d23f14f6ed7d";
const coinAssetType = '300';

const echelonRESTEndpoint = "https://rest-echelon-1.anvil.asia-southeast.initia.xyz";

async function _getResource(account, key, chain) {
  if (chain === 'aptos' || chain === 'move') {
    return getResource(account, key, chain);
  } else {
    // INITIA
    const url = `${echelonRESTEndpoint}/initia/move/v1/accounts/${account}/resources/by_struct_tag?struct_tag=${key}`;
    const { data } = await http.getWithMetadata(url);
    const moveResourceObject = data.resource.move_resource;
    const parsedObject = JSON.parse(moveResourceObject);

    return parsedObject.data;
  }
}

async function getMarketAddresses(network) {
  let lendingAddress;
  switch (network) {
    case 'aptos':
      lendingAddress = aptosLendingContract;
      break;
    case 'move':
      lendingAddress = movementLendingContract;
      break;
    default:
      lendingAddress = echelonChainLendingContract;
  }
  const lending = await _getResource(lendingAddress, `${lendingAddress}::lending::Lending`, network);
  return lending.market_objects.map(obj => obj.inner);
}

async function getMarket(network, marketAddress) {
  let lendingAddress;
  switch (network) {
    case 'aptos':
      lendingAddress = aptosLendingContract;
      break;
    case 'move':
      lendingAddress = movementLendingContract;
      break;
    default:
      lendingAddress = echelonChainLendingContract;
  }
  const market = await _getResource(marketAddress, `${lendingAddress}::lending::Market`, network)
  var coinInfo = null;
  if (market.asset_type === coinAssetType) {
    coinInfo = (await _getResource(marketAddress, `${lendingAddress}::lending::CoinInfo`, network)).type_name
  } else {
    coinInfo = (await _getResource(marketAddress, `${lendingAddress}::lending::FungibleAssetInfo`, network)).metadata.inner; 
  }
  
  return { cash: market.total_cash, liability: market.total_liability, fee: market.total_reserve, coin: coinInfo };
}

module.exports = {
  timetravel: false,
  methodology:
    "Aggregate TVL of both the Echelon main pool and its isolated pairs",
  aptos: {tvl, borrowed,  },
  move: {tvl, borrowed,  },
  echelon_initia: {tvl, borrowed,  },
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
