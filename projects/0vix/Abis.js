const OvixABI = [
  "function supplyRatePerTimestamp() view returns (uint256)",
  "function borrowRatePerTimestamp() view returns (uint256)",
  "function exchangeRateStored() view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function name() external view returns (string memory)",
  "function totalSupply() view returns (uint256)",
];

const erc20ABI = [
  "function decimals() external pure returns (uint8)",
  "function balanceOf(address owner) external view returns (uint256 balance)",
];

const unitrollerABI = [
  "function getAllMarkets() external view returns(address[] memory)",
];

const oracleABI = [
  "function getUnderlyingPrice(address oToken) view  returns (uint)",
  "function borrowBalanceStored(address account) view returns (uint256)",
];

module.exports = {
  OvixABI,
  erc20ABI,
  unitrollerABI,
  oracleABI,
};
