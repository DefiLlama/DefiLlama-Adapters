const abi = {
    getReserveTokensAddresses: "function getReserveTokensAddresses(address asset) view returns (address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress)",
    getAllReservesTokens: "function getAllReservesTokens() view returns ((string symbol, address tokenAddress)[])",
    getReserveData: "function getReserveData(address asset) view returns (uint256 unbacked, uint256 accruedToTreasuryScaled, uint256 totalAToken, uint256 totalStableDebt, uint256 totalVariableDebt, uint256 liquidityRate, uint256 variableBorrowRate, uint256 stableBorrowRate, uint256 averageStableBorrowRate, uint256 liquidityIndex, uint256 variableBorrowIndex, uint40 lastUpdateTimestamp)",
  };
  
  const CONFIG = {
    soneium: ['0x2BECa16DAa6Decf9C6F85eBA8F0B35696A3200b3','0x3b5FDb25672A0ea560E66905B97d0c818a00f5eb']
  };
  
  const fetchReserveData = async (api, poolDatas, isBorrowed) => {
    const reserveTokens = await api.multiCall({ calls: poolDatas, abi: abi.getAllReservesTokens });
    console.log("reserveTokens:", reserveTokens)  // 檢查獲取的代幣列表
    
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
      borrowed: (api) => fetchReserveData(api, poolDatas, true),
    };
  });
  