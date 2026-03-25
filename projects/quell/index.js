const RWA_VAULT = ["0xd85A4301706124699CbA8d0b59E5ED635360868b"];

module.exports = {
  doublecounted: true,
  methodology: "TVL is the total USDC deposited in the Quell RWAVault, an ERC-4626 vault on Base that routes to the Steakhouse USDC MetaMorpho vault for RWA yield.",
  base: { tvl: (api) => { api.erc4626Sum({ calls: RWA_VAULT.map(vault => vault), tokenAbi: 'address:asset', balanceAbi: 'uint256:totalAssets' }) } },
};
