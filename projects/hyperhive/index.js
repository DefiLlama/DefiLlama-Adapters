
const MARKET_HUB = '0xDD0CD3c660C8bcFC48B4d02f405fAa5d9D13099C'

const GET_MARKETS_ABI =
  'function getMarkets() view returns ((uint256 marketId, address market, address asset, uint8 assetDecimals, uint8 shareDecimals, bool enabled, bool miningEnabled, uint256 totalAssets, uint256 totalSupply, uint256 totalRewardsAccrued, uint256 apyBps, uint256 exchangeRate)[] result)'

async function tvl(api) {
  const markets = await api.call({
    target: MARKET_HUB,
    abi: GET_MARKETS_ABI,
  })

  for (const market of markets) {
    api.add(market.asset, market.totalAssets)
  }
}

module.exports = {
  doublecounted: true,
  methodology:
    'TVL is the sum of the underlying assets managed by all enabled HyperHive markets returned by the HiveMarketHub contract. Market balances are measured using each ERC-4626 market totalAssets value. HyperHive receipt tokens deposited into internal Mining pools are excluded to avoid double counting.',
  hyperliquid: {
    tvl,
  },
}