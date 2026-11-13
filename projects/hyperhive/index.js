const MARKET_HUB = '0xDD0CD3c660C8bcFC48B4d02f405fAa5d9D13099C'

const GET_MARKETS_ABI =
  'function getMarkets() view returns ((uint256 marketId, address market, address asset, uint8 assetDecimals, uint8 shareDecimals, bool enabled, bool miningEnabled, uint256 totalAssets, uint256 totalSupply, uint256 totalRewardsAccrued, uint256 apyBps, uint256 exchangeRate)[] result)'

async function tvl(api) {
  const markets = await api.call({ target: MARKET_HUB, abi: GET_MARKETS_ABI })
  markets.forEach(market => api.add(market.asset, market.totalAssets))
}

module.exports = {
  methodology:
    'Counts the total assets managed by every HyperHive market listed in the HiveMarketHub contract.',
  hyperliquid: {
    tvl,
  },
}
