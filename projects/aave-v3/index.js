const abi = {
  getReserveTokensAddresses: "function getReserveTokensAddresses(address asset) view returns (address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress)",
  getAllReservesTokens: "function getAllReservesTokens() view returns ((string symbol, address tokenAddress)[])",
  getReserveData: "function getReserveData(address asset) view returns (uint256 unbacked, uint256 accruedToTreasuryScaled, uint256 totalAToken, uint256 totalStableDebt, uint256 totalVariableDebt, uint256 liquidityRate, uint256 variableBorrowRate, uint256 stableBorrowRate, uint256 averageStableBorrowRate, uint256 liquidityIndex, uint256 variableBorrowIndex, uint40 lastUpdateTimestamp)",
};

const CONFIG = {
  ethereum: ['0x41393e5e337606dc3821075Af65AeE84D7688CBD', '0x08795CFE08C7a81dCDFf482BbAAF474B240f31cD', '0xE7d490885A68f00d9886508DF281D67263ed5758'],
  polygon: ['0x7F23D86Ee20D869112572136221e173428DD740B'],
  avax: ['0x7F23D86Ee20D869112572136221e173428DD740B'],
  arbitrum: ['0x7F23D86Ee20D869112572136221e173428DD740B'],
  optimism: ['0x7F23D86Ee20D869112572136221e173428DD740B'],
  harmony: ['0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654'],
  fantom: ['0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654'],
  metis: ['0xC01372469A17b6716A38F00c277533917B6859c0'],
  base: ['0xd82a47fdebB5bf5329b09441C3DaB4b5df2153Ad'],
  xdai: ['0x57038C3e3Fe0a170BB72DE2fD56E98e4d1a69717'],
  scroll: ['0xe2108b60623C6Dcf7bBd535bD15a451fd0811f7b'],
  bsc: ['0x23dF2a19384231aFD114b036C14b6b03324D79BC'],
  era: ['0x5F2A704cE47B373c908fE8A29514249469b52b99'],
  linea: ['0x2D97F8FA96886Fd923c065F5457F9DDd494e3877'],
  sonic: ['0x306c124fFba5f2Bc0BcAf40D249cf19D492440b9'],
  celo: ['0x33b7d355613110b4E842f5f7057Ccd36fb4cee28']
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
