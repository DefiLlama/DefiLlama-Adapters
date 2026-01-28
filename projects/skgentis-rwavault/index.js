const ADDRESSES = require('../helper/coreAssets.json');

// SKGentis RWA Vault V5 Contract Addresses
// Mainnet deployed: Dec 9, 2025 at block 23976885
const CONTRACTS = {
  ethereum: {
    vault: '0x5Cd76ca2978a80B0D4655123815803140699E506',
  }
};

// RWA Vault V5 ABI - only functions needed for TVL calculation
const VAULT_ABI = {
  totalSupply: "function totalSupply() view returns (uint256 count)",
  ethBalance: "function ethBalance(uint256 tokenId) view returns (uint256)"
};

/**
 * Calculate TVL by summing ETH balances across all vault tokens
 * Each vault token (ERC721) holds ETH deposits for funding real-world assets
 * 
 * @param {object} api - DeFiLlama SDK API
 * @returns {object} Balances object with native ETH
 */
async function tvl(api) {
  const vaultAddress = CONTRACTS[api.chain]?.vault;
  
  if (!vaultAddress) {
    return {};
  }

  // Get total number of minted vault tokens
  const totalSupply = await api.call({
    target: vaultAddress,
    abi: VAULT_ABI.totalSupply
  });

  const numTokens = Number(totalSupply);
  if (numTokens === 0) {
    return {};
  }

  // Build array of token IDs [0, 1, 2, ...]
  const tokenIds = Array.from({ length: numTokens }, (_, i) => i);

  // Batch call to get ETH balance for each vault token
  const balances = await api.multiCall({
    calls: tokenIds.map(id => ({
      target: vaultAddress,
      params: [id]
    })),
    abi: VAULT_ABI.ethBalance
  });

  // Sum all ETH balances across vault tokens
  let totalEthWei = 0n;
  for (const balance of balances) {
    if (balance) {
      totalEthWei += BigInt(balance);
    }
  }

  // Add native ETH to balances (null address = native ETH)
  api.add(ADDRESSES.null, totalEthWei.toString());
  
  return api.getBalances();
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'TVL is calculated by summing the ETH deposited across all RWA vault tokens (ERC721). Each vault token represents a real-world asset being crowdfunded through ETH deposits. The vault holds ETH until funding targets are met.',
  start: 23976885,
  ethereum: {
    tvl
  }
};
