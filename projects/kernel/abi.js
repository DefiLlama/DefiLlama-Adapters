exports.abi = {
  numApprovedTokens: "function numApprovedTokens() view returns (uint256)",
  approvedTokens: "function approvedTokens(uint256) view returns (address)",
  tokens: "function tokens(address) view returns (address vaultToken, address rateProvider, uint256 cap, uint256 deposited, bool paused)"
};