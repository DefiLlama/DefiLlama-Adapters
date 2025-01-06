const abi = {
    getReserveTokensAddresses: "function getReserveTokensAddresses(address asset) view returns (address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress)",
    getAllReservesTokens: "function getAllReservesTokens() view returns ((string symbol, address tokenAddress)[])",
    getReserveData: "function getReserveData(address asset) view returns (uint256 unbacked, uint256 accruedToTreasuryScaled, uint256 totalAToken, uint256 totalStableDebt, uint256 totalVariableDebt, uint256 liquidityRate, uint256 variableBorrowRate, uint256 stableBorrowRate, uint256 averageStableBorrowRate, uint256 liquidityIndex, uint256 variableBorrowIndex, uint40 lastUpdateTimestamp)",
};
  
const CONFIG = {
  fraxtal: ['0xFB3adf4c845fD6352D24F3F0981eb7954401829c'],
};

const fetchReserveData = async (api, poolDatas, isBorrowed) => {
  const reserveTokens = await api.multiCall({ 
    calls: poolDatas, 
    abi: abi.getAllReservesTokens 
  });
  const calls = [];

  poolDatas.map((pool, i) => {
    reserveTokens[i].forEach(({ tokenAddress }) => 
      calls.push({ target: pool, params: tokenAddress })
    );
  });

  const reserveData = await api.multiCall({ 
    abi: isBorrowed ? abi.getReserveData : abi.getReserveTokensAddresses, 
    calls 
  });

  const tokensAndOwners = [];
  reserveData.forEach((data, i) => {
    const token = calls[i].params;
    if (isBorrowed) {
      api.add(token, data.totalVariableDebt);
      api.add(token, data.totalStableDebt);
    } else {
      tokensAndOwners.push([token, data.aTokenAddress]);
    }
  });

  if (isBorrowed) return api.getBalances();
  return api.sumTokens({ tokensAndOwners });
}
  
module.exports.methodology = "Counts both the tokens locked as collateral and borrowed tokens in the protocol. This includes tokens used as collateral to borrow or earn yield, as well as the total borrowed tokens (both stable and variable rate borrows)."
  
Object.keys(CONFIG).forEach((chain) => {
  const poolDatas = CONFIG[chain];
  module.exports[chain] = {
    tvl: async (api) => {
      const baseTokens = await fetchReserveData(api, poolDatas);
      const borrowedTokens = await fetchReserveData(api, poolDatas, true);
      return {
        ...baseTokens,
        ...borrowedTokens
      };
    },
    borrowed: (api) => fetchReserveData(api, poolDatas, true),
  };
});

module.exports.hallmarks = []