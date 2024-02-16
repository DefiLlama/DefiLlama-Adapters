module.exports = {
  getTotalAmounts:
    "function getTotalAmounts() public view returns (uint256 total0, uint256 total1, uint128 liquidity)",
  token0: "function token0() external view returns (address)",
  token1: "function token1() external view returns (address)",
  depositToken: "function depositToken() external view returns (address)",
  totalTokens: "function totalTokens() external view returns (uint256)",
  getVaults: {
    inputs: [],
    name: "getVaults",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "vault",
            type: "address",
          },
          {
            internalType: "bytes",
            name: "data",
            type: "bytes",
          },
        ],
        internalType: "struct VaultRegistry.VaultInfo[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
};
