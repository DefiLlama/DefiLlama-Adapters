// Accountable - ERC-4626 vault protocol
// Converts vault token supply to underlying assets (USD) for TVL calculation

const VAULTS = {
  monad: [
    {
      vaultToken: '0x4C0d041889281531fF060290d71091401Caa786D', // sbMU vault token
      underlyingToken: '0x754704Bc059F8C67012fEd69BC8A327a5aafb603', // USDC
    },
    // Add more Monad vaults here as they are deployed:
    // { vaultToken: '0x...', underlyingToken: '0x...' },
  ],
  // Add other chains as Accountable expands:
  // ethereum: [
  //   { vaultToken: '0x...', underlyingToken: '0x...' },
  // ],
  // arbitrum: [
  //   { vaultToken: '0x...', underlyingToken: '0x...' },
  // ],
};

async function tvl(api) {
  const chain = api.chain;
  const vaults = VAULTS[chain];

  if (!vaults) return;

  for (const vault of vaults) {
    // Get total vault token supply
    const totalSupply = await api.call({
      target: vault.vaultToken,
      abi: 'erc20:totalSupply',
    });

    // Convert vault shares to underlying assets
    const underlyingAmount = await api.call({
      target: vault.vaultToken,
      params: [totalSupply],
      abi: 'function convertToAssets(uint256 shares) view returns (uint256)',
    });

    // Add underlying token balance to TVL
    api.add(vault.underlyingToken, underlyingAmount);
  }
}

module.exports = {
  methodology: 'TVL is calculated by converting vault token supply to underlying assets using convertToAssets()',
  monad: { tvl },
  // When expanding to other chains, add them here:
  // ethereum: { tvl },
  // arbitrum: { tvl },
};
