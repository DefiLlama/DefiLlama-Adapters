const abi = {
    getReserveTokensAddresses: "function getReserveTokensAddresses(address asset) view returns (address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress)",
    getAllReservesTokens: "function getAllReservesTokens() view returns ((string symbol, address tokenAddress)[])",
    getReserveData: "function getReserveData(address asset) view returns (uint256 unbacked, uint256 accruedToTreasuryScaled, uint256 totalAToken, uint256 totalStableDebt, uint256 totalVariableDebt, uint256 liquidityRate, uint256 variableBorrowRate, uint256 stableBorrowRate, uint256 averageStableBorrowRate, uint256 liquidityIndex, uint256 variableBorrowIndex, uint40 lastUpdateTimestamp)",
  };
  
  const CONFIG = {
    unit0: ['0x99118c1Ca7D0DC824719E740d4b4721009a267d6'], // Unilend on Unit Zero
  };
  
  const fetchReserveData = async (api, poolDatas, isBorrowed) => {
    const reserveTokens = await api.multiCall({ calls: poolDatas, abi: abi.getAllReservesTokens });
    const calls = [];
  
    poolDatas.forEach((pool, i) => {
      reserveTokens[i].forEach(({ tokenAddress }) => {
        calls.push({ target: pool, params: tokenAddress });
      });
    });
  
    const reserveData = await api.multiCall({
      abi: isBorrowed ? abi.getReserveData : abi.getReserveTokensAddresses,
      calls,
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
  };
  
  module.exports.methodology = "Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted.";
  
  Object.keys(CONFIG).forEach((chain) => {
    const poolDatas = CONFIG[chain];
    module.exports[chain] = {
      tvl: (api) => fetchReserveData(api, poolDatas),
      borrowed: (api) => fetchReserveData(api, poolDatas, true),
    };
  });
  