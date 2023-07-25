
const FACTORY_CONTRACT_ETH = "0xD6348E8EacE62Eb3Eb77fBbA8D8c363e375fC455";
const EURS_CONTRACT_ETH= "0xdb25f211ab05b1c97d595516f45794528a807ad8";

async function borrowed(_, _1, _2, { api }) {
  // Get all vaults
  const vaultIds = await api.call({ 
    abi: "function getLoanVaultIds() external view returns (string[])",
    target: FACTORY_CONTRACT_ETH
  })
  const vaultContracts = await api.multiCall({  abi: "function getLoanVault (string loanVaultId) external view returns (address)", target: FACTORY_CONTRACT_ETH, calls: vaultIds })
  const loans = await api.multiCall({  abi: "function loansOutstanding() external view returns (uint256)", calls: vaultContracts})
  // Take the sum of all vault tokens in terms of EURS (1 Loan Vault Token = 1 EURS Statis) on the platform | 18-2 = 16 atomic units (LV-EURS
  loans.forEach((val, i) => api.add(EURS_CONTRACT_ETH, val / 1e16))
}

module.exports = {
  start: 16077400,
  methodology: "Data is retrieved on-chain by taking the total sum of all loans outstanding (dominated in EURS Statis) from all platform vaults.",
  ethereum: { borrowed, tvl: () => ({}) }
}
