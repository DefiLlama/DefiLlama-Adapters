const sdk = require('@defillama/sdk');

// Kerne Protocol TVL Adapter
// ERC-4626 Vault on Base

const VAULT_ADDRESS = "0xDF9a2f5152c533F7fcc3bAdEd41e157C9563C695";
const WETH_ADDRESS = "0x4200000000000000000000000000000000000006";

async function tvl(api) {
  // Call totalAssets() on the ERC-4626 vault
  const totalAssets = await api.call({
    target: VAULT_ADDRESS,
    abi: 'function totalAssets() view returns (uint256)',
  });
  
  // Add the totalAssets value as the underlying WETH
  api.add(WETH_ADDRESS, totalAssets);
}

module.exports = {
  methodology: "TVL is calculated by calling totalAssets() on the KerneVault ERC-4626 contract. This reflects the net asset value of the vault, including on-chain collateral and verified hedging reserves.",
  base: {
    tvl,
  },
};
