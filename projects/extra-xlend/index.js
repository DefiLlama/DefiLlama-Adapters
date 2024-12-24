const abi = {
  getReserveTokensAddresses: "function getReserveTokensAddresses(address asset) view returns (address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress)",
  getAllReservesTokens: "function getAllReservesTokens() view returns ((string symbol, address tokenAddress)[])",
  getReserveData: "function getReserveData(address asset) view returns (uint256 unbacked, uint256 accruedToTreasuryScaled, uint256 totalAToken, uint256 totalStableDebt, uint256 totalVariableDebt, uint256 liquidityRate, uint256 variableBorrowRate, uint256 stableBorrowRate, uint256 averageStableBorrowRate, uint256 liquidityIndex, uint256 variableBorrowIndex, uint40 lastUpdateTimestamp)",
  getAllATokens: "function getAllATokens() view returns ((string symbol, address tokenAddress)[])"
};

const CONFIG = {
  optimism: {
    dataProvider: '0xCC61E9470B5f0CE21a3F6255c73032B47AaeA9C0',
  },
}

const fetchTvlData = async (api, provider) => {
  const tokens = await api.call({ target: provider, abi: abi.getAllReservesTokens });
  const ATokens = await api.call({ target: provider, abi: abi.getAllATokens });

  const tokensAndOwners = []
  tokens.forEach((data, i) => {
    const aToken = ATokens[i]
    tokensAndOwners.push([data.tokenAddress, aToken.tokenAddress])
  })
  return api.sumTokens({ tokensAndOwners })
}


const fetchBorrowData = async (api, provider) => {
  const tokens = await api.call({ target: provider, abi: abi.getAllReservesTokens });
  const calls = []
  tokens.forEach(({ tokenAddress }) => calls.push({ target: provider, params: tokenAddress }));
  const reserveData = await api.multiCall({ abi: abi.getReserveData, calls });
  reserveData.forEach((data, i) => {
    const token = calls[i].params
    api.add(token, data.totalVariableDebt)
    api.add(token, data.totalStableDebt)
  })
  return api.getBalances()
}

Object.keys(CONFIG).forEach((chain) => {
  module.exports[chain] = {
    tvl: (api) => fetchTvlData(api, CONFIG[chain].dataProvider),
    borrowed: (api) => fetchBorrowData(api, CONFIG[chain].dataProvider),
  };
});