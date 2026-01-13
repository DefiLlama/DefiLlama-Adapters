const sdk = require('@defillama/sdk');

// Kerne Protocol TVL Adapter
// ERC-4626 Vault on Base

const VAULT_ADDRESS = "0x5FD0F7eA40984a6a8E9c6f6BDfd297e7dB4448Bd";
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
