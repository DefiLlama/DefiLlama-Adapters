async function tvl(api) {
  const { PSM, cdpManager, getCollateralInfo } = config[api.chain]
  const ids = await api.call({ abi: abi.getCollateralIds, target: cdpManager })
  const psmTokens = await api.call({ abi: abi.getPSMTokens, target: PSM })
  const psmInfos = await api.multiCall({ abi: abi.getPSMTokenInfo, calls: psmTokens, target: PSM })
  const infos = await api.multiCall({ abi: getCollateralInfo, calls: ids, target: cdpManager })
  infos.forEach(info => api.add(info.token, info.balance))
  psmInfos.forEach((info, i) => api.add(psmTokens[i], info.balance))
}

const config = {
  wemix: {
    cdpManager: '0x1B18d5a2f35B431aACa02B58eE9E4B7FBa9b098d',
    PSM: '0xbdd0b6212505bcD15C38839cf338E40aeCd95b13',
    getCollateralInfo: "function getCollateralInfo(uint256 collateralId) view returns (tuple(address token, address investor, uint256 balance, uint256 maxLTV, uint256 liquidationLTV, uint256 debtCeiling, uint256 interestRate, uint256 liquidationBonusRate, uint256 lastUpdateTime, uint256 lastVaultId, tuple(uint256 originalDebt, uint256 debt, uint256 debtShare) debtInfo) collateralInfo)",
  },
  klaytn: {
    cdpManager: '0x1962862De07BCf48680913a47F45A80022e6869a',
    PSM: '0x90Da6Ed29eCCA4CFa0BE8Da50623de5aB86c285b',
    getCollateralInfo: "function getCollateralInfo(uint256 collateralId) view returns (tuple(address token, address investor, bool isLeverage, uint256 balance, uint256 maxLTV, uint256 liquidationLTV, uint256 debtCeiling, uint256 interestRate, uint256 liquidationBonusRate, uint256 lastUpdateTime, uint256 lastVaultId, tuple(uint256 originalDebt, uint256 debt, uint256 debtShare) debtInfo) collateralInfo)",
  }
};

const abi = {
  "getCollateralIds": "uint256[]:getCollateralIds",
  "getPSMTokenInfo": "function getPSMTokenInfo(address token) view returns (tuple(uint256 mintLimit, uint256 minReserve, uint256 balance, uint256 mintAmount, uint256 collateralId, address investor) tokenInfo)",
  "getPSMTokens": "address[]:getPSMTokens",
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {    tvl  }
})