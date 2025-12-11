const config = {
  arbitrum: [
    '0x57C10bd3fdB2849384dDe954f63d37DfAD9d7d70', // tUSDC Vault
    '0xcd72118C0707D315fa13350a63596dCd9B294A30', // tUSDT Vault
  ],
  base: [
    '0x6C7013b3596623d146781c90b4Ee182331Af6148', // tUSDC Vault
  ]
};

const abi = "function getDepositBalance(address user, address vault) view returns (uint256 balance)";

module.exports = {
  methodology: "TVL displays the total amount of assets stored in the Thesauros vaults. The balance is calculated by querying the active provider for each vault's deposit balance.",
  start: '2025-09-19',
  hallmarks: [[1758283200, "Protocol launch"]],
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl: (api) => tvl(api, config[chain]) };
});

/**
 * Calculate TVL for Thesauros vaults
 * @param {Object} api - DefiLlama API helper
 * @param {Array<string>} vaults - Array of vault contract addresses
 */
const tvl = async (api, vaults) => {
  // Get active provider and asset address for each vault
  const [providers, assets] = await Promise.all([
    api.multiCall({ calls: vaults, abi: "address:activeProvider" }),
    api.multiCall({ calls: vaults, abi: "address:asset" }),
  ]);

  // Get deposit balance from each provider
  // Parameters: [vault address as user, vault address as vault]
  // The vault acts as both the user and the vault parameter
  const balances = await api.multiCall({ 
    calls: vaults.map((vault, i) => ({ 
      target: providers[i], 
      params: [vault, vault] 
    })), 
    abi 
  });

  // Add assets with their balances to the TVL calculation
  api.add(assets, balances);
};
