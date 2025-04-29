const ethers = require("ethers");

const MARKET_LENS = "0x7fB0d63E84D847569ca75A6cdbA283bA1401F9f6";
const ADDRESS_REGISTRY = "0x86ccFbEc579D491e9b37354187dD48a1a9C7c1E7"; 

const ABI = {
  AddressRegistry: {
    getAddresses: "function getAddresses(bytes32[] keys) view returns (address[])"
  },
  MarketLens: {
    getMarketQuery: "function getMarketQuery(uint256 marketId) view returns (tuple(address marketAsset, string marketAssetSymbol, uint8 marketAssetDecimals, uint256 maxSupply, uint256 totalShares, uint256 totalAssets, uint256 exchangeRate, uint256 totalReserveAssets, uint256 totalLiabilities, uint256 utilization, uint256 borrowRate, uint256 supplyRate))"
  }
};

async function lookupAddresses(keys) {
  return await api.call({
    abi: ABI.AddressRegistry.getAddresses,
    target: ADDRESS_REGISTRY,
    params: [keys.map(key => ethers.keccak256(ethers.toUtf8Bytes(key)))]
  });
}

async function getAllMarkets() {
  const markets = [];
  let i = 1;
  
  while (true) {
    const addresses = await lookupAddresses([`hyperdrive.market.${i}`]);
    if (addresses[0] !== '0x0000000000000000000000000000000000000000') {
      markets.push(addresses[0]);
      i++;
    } else {
      break;
    }
  }
  
  return markets;
}

async function tvl(api) {
  const markets = await getAllMarkets();
  
  for (let i = 0; i < markets.length; i++) {
    const marketData = await api.call({
      abi: ABI.MarketLens.getMarketQuery,
      target: MARKET_LENS,
      params: [i]
    });
    
    api.add(marketData.marketAsset, marketData.totalAssets);
  }
  
  return api.getBalances();
}

async function borrowed(api) {
  const markets = await getAllMarkets();
  
  for (let i = 0; i < markets.length; i++) {
    const marketData = await api.call({
      abi: ABI.MarketLens.getMarketQuery,
      target: MARKET_LENS,
      params: [i]
    });
    
    api.add(marketData.marketAsset, marketData.totalLiabilities);
  }
  
  return api.getBalances();
}

module.exports = {
  arbitrum: {
    tvl,
    borrowed,
  },
  methodology: "Gets the TVL for the protocol",
};
