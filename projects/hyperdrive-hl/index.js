const MARKET_ROUTER = "FILL";
const MARKET_LENS = "0x7fB0d63E84D847569ca75A6cdbA283bA1401F9f6";

const ABI = {
  MarketRouter: {
    getMarkets: "function getMarkets() view returns (address[])"
  },
  MarketLens: {
    getMarketQuery: "function getMarketQuery(uint256 marketId) view returns (tuple(address marketAsset, string marketAssetSymbol, uint8 marketAssetDecimals, uint256 maxSupply, uint256 totalShares, uint256 totalAssets, uint256 exchangeRate, uint256 totalReserveAssets, uint256 totalLiabilities, uint256 utilization, uint256 borrowRate, uint256 supplyRate))"
  }
};

async function tvl(api) {
  const markets = await api.call({
    abi: ABI.MarketRouter.getMarkets,
    target: MARKET_ROUTER
  });
  
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
   const markets = await api.call({
    abi: ABI.MarketRouter.getMarkets,
    target: MARKET_ROUTER
  });
  
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
