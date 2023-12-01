
const abi = {
  "getMarketsCount": "uint256:getMarketsCount",
  "getPaginatedMarketsData": "function getPaginatedMarketsData(uint256 start, uint256 end) view returns (tuple(tuple(address token, string name, string symbol, uint256 decimals, bool isMock) marketToken, tuple(address token, string name, string symbol, uint256 decimals, bool isMock) underlyingToken, address borrower, address controller, address feeRecipient, uint256 protocolFeeBips, uint256 delinquencyFeeBips, uint256 delinquencyGracePeriod, uint256 withdrawalBatchDuration, uint256 reserveRatioBips, uint256 annualInterestBips, bool temporaryReserveRatio, uint256 originalAnnualInterestBips, uint256 originalReserveRatioBips, uint256 temporaryReserveRatioExpiry, bool isClosed, uint256 scaleFactor, uint256 totalSupply, uint256 maxTotalSupply, uint256 scaledTotalSupply, uint256 totalAssets, uint256 lastAccruedProtocolFees, uint256 normalizedUnclaimedWithdrawals, uint256 scaledPendingWithdrawals, uint256 pendingWithdrawalExpiry, bool isDelinquent, uint256 timeDelinquent, uint256 lastInterestAccruedTimestamp, uint32[] unpaidWithdrawalBatchExpiries, uint256 coverageLiquidity, uint256 borrowableAssets, uint256 delinquentDebt)[] data)",
}

// https://wildcat-protocol.gitbook.io/wildcat/technical-deep-dive/contract-deployments
const config = {
  ethereum: { lens: '0xf1D516954f96c1363f8b0aE48D79c8ddE6237847', },
}

Object.keys(config).forEach(chain => {
  const { lens } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const markets = await getMarkets(api)
      markets.forEach(market => {
        api.add(market.underlyingToken.token, market.borrowableAssets)
      })
      return api.getBalances()
    },
    borrowed: async (_, _b, _cb, { api, }) => {
      const markets = await getMarkets(api)
      markets.forEach(market => {
        api.add(market.underlyingToken.token, market.borrowableAssets * -1)
        api.add(market.underlyingToken.token, market.totalAssets)
      })
      return api.getBalances()
    }
  }

  async function getMarkets(api) {
    const count = await api.call({  abi: abi.getMarketsCount, target: lens})
    let length = 42
    let start = 0
    const allMarkets = []
    while (start < count) {
      const end = start + length
      const markets = await api.call({ abi: abi.getPaginatedMarketsData, target: lens, params: [start, end] })
      allMarkets.push(...markets)
      start = end
    }
    console.log(allMarkets)
    return allMarkets
  }
})