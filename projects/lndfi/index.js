const abi = {
  getReserveTokensAddresses: "function getReserveTokensAddresses(address asset) view returns (address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress)",
  getAllReservesTokens: "function getAllReservesTokens() view returns ((string symbol, address tokenAddress)[])",
  getReserveData: "function getReserveData(address asset) view returns (uint256 unbacked, uint256 accruedToTreasuryScaled, uint256 totalAToken, uint256 totalStableDebt, uint256 totalVariableDebt, uint256 liquidityRate, uint256 variableBorrowRate, uint256 stableBorrowRate, uint256 averageStableBorrowRate, uint256 liquidityIndex, uint256 variableBorrowIndex, uint40 lastUpdateTimestamp)",
};

const CONFIG = {
  sonic: ['0x82c7B4aBB462dE2f7bFDE40c05d1fAa3913DbBB3'],
  hyperliquid: ['0x0F0E6905B0199393b9102be42f28f71c22e30151'],
};

const fetchReserveData = async (api, poolDatas, isBorrowed) => {
  const reserveTokens = await api.multiCall({ calls: poolDatas, abi: abi.getAllReservesTokens });
  const calls = []

  poolDatas.map((pool, i) => {
    reserveTokens[i].forEach(({ tokenAddress }) => calls.push({ target: pool, params: tokenAddress }));
  });
  const reserveData = await api.multiCall({ abi: isBorrowed ? abi.getReserveData : abi.getReserveTokensAddresses, calls, })
  const tokensAndOwners = []
  reserveData.forEach((data, i) => {
    const token = calls[i].params
    if (isBorrowed) {
      api.add(token, data.totalVariableDebt)
      api.add(token, data.totalStableDebt)
    } else
      tokensAndOwners.push([token, data.aTokenAddress])
  })

  if (isBorrowed) return api.getBalances()
  return api.sumTokens({ tokensAndOwners })
}

module.exports.methodology = "Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending."

Object.keys(CONFIG).forEach((chain) => {
  const poolDatas = CONFIG[chain];
  module.exports[chain] = {
    tvl: (api) => fetchReserveData(api, poolDatas),
    // borrowed: (api) => fetchReserveData(api, poolDatas, true),
    borrowed: () => ({}),
  };
});

module.exports.hallmarks = [
  ['2025-05-10', 'Protocol was hacked'],
]
