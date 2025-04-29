module.exports = {
  vaultParams: "function vaultParams() view returns (uint8 decimals, address asset, uint56 minimumSupply, uint104 cap )",
  currentExchangeRate: "function currentExchangeRate() view returns (uint256 vaultToken, uint256 baseToken)",
  totalBalance: "uint256:totalBalance",
  asset: "function asset() view returns (address)",
  totalSupply: "function totalSupply() view returns (uint256)"
};
