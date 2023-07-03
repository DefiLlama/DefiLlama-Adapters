const sdk = require("@defillama/sdk");

const FACTORY_CONTRACT_ETH = "0xD6348E8EacE62Eb3Eb77fBbA8D8c363e375fC455";
const EURS_CONTRACT_ETH= "0xdb25f211ab05b1c97d595516f45794528a807ad8";

async function tvl(_, _1, _2, { api }) {
  
  const balances = {};

  // Get all vaults
  const vaultIds = await api.call({ 
    abi: "function getLoanVaultIds() external view returns (string[])",
    target: FACTORY_CONTRACT_ETH
  });

  // Get the sum of loansOutstanding (TVL)
  for(const vaultId of vaultIds) {

    const VAULT_CONTRACT = await api.call({ abi: "function getLoanVault (string loanVaultId) external view returns (address)", target: FACTORY_CONTRACT_ETH, params: [vaultId] });

    const loansOutstanding = await api.call({ abi: "function loansOutstanding() external view returns (uint256)", target: VAULT_CONTRACT });

    //api.add(VAULT_CONTRACT, loansOutstanding)

    // Take the sum of all vault tokens in terms of EURS (1 Loan Vault Token = 1 EURS Statis) on the platform | 18-2 = 16 atomic units (LV-EURS)
    sdk.util.sumSingleBalance(balances, EURS_CONTRACT_ETH, Number(loansOutstanding) / Math.pow(10, 16));
  }

  return balances
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  start: 16077400,
  methodology: "Data is retrieved on-chain by taking the total sum of all loans outstanding (dominated in EURS Statis) from all platform vaults.",
  ethereum: { tvl }
}
