
const CONTRACT_ETH_VAULTS = "0xD6348E8EacE62Eb3Eb77fBbA8D8c363e375fC455";
const CONTRACT_ETH_BRIDGE= "0xcee284f754e854890e311e3280b767f80797180d";
const CONTRACT_ETH_EURS = "0xdb25f211ab05b1c97d595516f45794528a807ad8";
const CONTRACT_ETH_FLR= "0x5e5d9aeec4a6b775a175b883dca61e4297c14ecb";
const CONTRACT_ARB_VAULTS = "0x19A2106475b29F0ff5053AE026190ce7A9227cE3";
const CONTRACT_ARB_EURS = "0xd22a58f79e9481d1a88e00c343885a588b34b68b";

async function borrowedETH(_, _1, _2, { api }) {
  // Get all vaults
  const vaultIds = await api.call({ 
    abi: "function getLoanVaultIds() external view returns (string[])",
    target: CONTRACT_ETH_VAULTS
  })
  const vaultContracts = await api.multiCall({  abi: "function getLoanVault (string loanVaultId) external view returns (address)", target: CONTRACT_ETH_VAULTS, calls: vaultIds })
  const loans = await api.multiCall({  abi: "function loansOutstanding() external view returns (uint256)", calls: vaultContracts})
  
  let sumLoans = 0;
  loans.forEach((val, i) => sumLoans += Number(val))

  // Subtract Bridged FLR (EURS) to Arbitrum from Ethereum (migration)
  const migratedAmount = await api.call({ 
    abi: "function balanceOf(address account) view returns (uint256)",
    target: CONTRACT_ETH_FLR,
    params: [CONTRACT_ETH_BRIDGE]
  })

  // Subtract migratedAmount from sumLoans and express it in terms of EURS (1 Vault Token = 1 EURS)
  api.add(CONTRACT_ETH_EURS, (sumLoans - migratedAmount) / 1e16)
}

async function borrowedARB(_, _1, _2, { api }) {
  // Get all vaults
  const vaultIds = await api.call({ 
    abi: "function getLoanVaultIds() external view returns (string[])",
    target: CONTRACT_ARB_VAULTS
  })
  const vaultContracts = await api.multiCall({  abi: "function getLoanVault (string loanVaultId) external view returns (address)", target: CONTRACT_ARB_VAULTS, calls: vaultIds })
  const loans = await api.multiCall({  abi: "function loansOutstanding() external view returns (uint256)", calls: vaultContracts})
  // Take the sum of all vault tokens in terms of EURS (1 Loan Vault Token = 1 EURS Statis) on the platform | 18-2 = 16 atomic units (LV-EURS
  loans.forEach((val, i) => api.add(CONTRACT_ARB_EURS, val / 1e16))
}

module.exports = {
  methodology: "Data is retrieved on-chain by taking the total sum of all loans outstanding (dominated in EURS Statis) from all platform vaults. Florence Finance is currently migrating from Ethereum to Arbitrum.",
  ethereum: { start: 16077400, borrowed: borrowedETH, tvl: () => ({}) },
  arbitrum: { start: 126183410, borrowed: borrowedARB, tvl: () => ({}) },
}
