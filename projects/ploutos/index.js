const abi = {
  getReserveTokensAddresses: "function getReserveTokensAddresses(address asset) view returns (address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress)",
  getAllReservesTokens: "function getAllReservesTokens() view returns ((string symbol, address tokenAddress)[])",
  getReserveData: "function getReserveData(address asset) view returns (uint256 unbacked, uint256 accruedToTreasuryScaled, uint256 totalAToken, uint256 totalStableDebt, uint256 totalVariableDebt, uint256 liquidityRate, uint256 variableBorrowRate, uint256 stableBorrowRate, uint256 averageStableBorrowRate, uint256 liquidityIndex, uint256 variableBorrowIndex, uint40 lastUpdateTimestamp)",
};

// Ploutos - Aave v3 fork
// AaveProtocolDataProviders
// https://docs.ploutos.money/contracts-addresses
const CONFIG = {
  base: ['0x7dcb86dC49543E14A98F80597696fe5f444f58bC'],
  arbitrum: ['0x0F65a7fBCb69074cF8BE8De1E01Ef573da34bD59'],
  polygon: ['0x6A9b632010226F9bBbf2B6cb8B6990bE3F90cb0e'],
  katana: ['0x4DC446e349bDA9516033E11D63f1851d6B5Fd492'],
  plasma: ['0x9C48A6D3e859ab124A8873D73b2678354D0B4c0A'],
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
    borrowed: (api) => fetchReserveData(api, poolDatas, true),
  };
});

module.exports.hallmarks = [
  [1659630089, "Start OP Rewards"],
  [1650471689, "Start AVAX Rewards"]
]
