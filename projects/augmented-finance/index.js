const methodologies = require("../helper/methodologies");

const config = {
  ethereum: '0x9276635Ec39C72866f3cF70298eFe501EB5dcDf1',
  bsc: '0xEdBDF91ac20287e332c761179FaCe71eba9FBc93',
  avax: '0xb2e7216F2f70ac9d9Eec70e1Ca6f2f1CADf218D5',
  xdai: '0x75e5cF901f3A576F72AB6bCbcf7d81F1619C6a12',
}

module.exports = {
  methodology: methodologies.lendingMarket,
  // deadFrom: 2024-02-22
};

Object.keys(config).forEach(chain => {
  const provider = config[chain]
  module.exports[chain] = {
    borrowed: () => ({}), // project abandoned?
    tvl: async (api) => {
      if (chain === 'xdai') return {}
      const tokens = await api.call({  abi: abi.getReservesList, target: config[chain] })
      const data = await api.multiCall({  abi: abi.getReserveData, calls: tokens, target: config[chain]})
      const owners = data.map(c=>c.depositTokenAddress)
      return api.sumTokens({ tokensAndOwners2: [tokens, owners] })
    }
  }})

const abi = {
   "getReserveData": "function getReserveData(address asset) view returns (((uint256 data) configuration, uint128 liquidityIndex, uint128 variableBorrowIndex, uint128 currentLiquidityRate, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, address depositTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address strategy, uint8 id))",
  "getReserveNormalizedIncome": "function getReserveNormalizedIncome(address asset) view returns (uint256)",
  "getReserveNormalizedVariableDebt": "function getReserveNormalizedVariableDebt(address asset) view returns (uint256)",
  "getReservesList": "address[]:getReservesList",
}