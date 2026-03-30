const RWA_VAULT = ["0x25cf6D8BacCFbF66DC0567844182F063b8BD0051"];

module.exports = {
  doublecounted: true,
  methodology: "TVL is the total USDC deposited in the Quell RWAVault, an ERC-4626 vault on Arbitrum that routes to Spark sUSDC for RWA yield via the Sky Savings Rate.",
  arbitrum: { tvl: (api) => api.erc4626Sum({ calls: RWA_VAULT, tokenAbi: 'address:asset', balanceAbi: 'uint256:totalAssets' }) },
};
