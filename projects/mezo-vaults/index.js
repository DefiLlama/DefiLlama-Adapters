// Only tracks mezo vaults - external ones are tracked in their corresponding adapter (e.g. mellow-protocol-core/index.js)
// https://github.com/mezo-org/documentation/blob/main/src/content/docs/docs/users/mezo-earn/vaults/index.md#vault-types
const VAULTS = [
  '0xb4D498029af77680cD1eF828b967f010d06C51CC', // sMUSD — MUSD Savings Rate
];

// USDC Lending Vault: a standard ERC4626 Morpho Vault V2 that supplies the Morpho Blue BTC/mUSDC market.
// https://github.com/mezo-org/documentation/blob/main/src/content/docs/docs/users/mezo-earn/vaults/usdc-lending-vault.md
const ERC4626_VAULTS = [
  '0x06291b67e3d7660240ab44Afc9a708d82b976a8B', // morphoBTC-mUSDC
];

async function tvl(api) {
  const strategies = await api.multiCall({ calls: VAULTS, abi: 'address:strategy' });
  const tokens = await api.multiCall({ calls: strategies, abi: 'address:token' });
  const tokensAndOwners = VAULTS.flatMap((vault, i) => [
    [tokens[i], vault],
    [tokens[i], strategies[i]],
  ]);
  await api.sumTokens({ tokensAndOwners });
  return api.erc4626Sum({ calls: ERC4626_VAULTS, isOG4626: true });
}

module.exports = {
  methodology: 'Sums underlying-token balances held at each Mezo native earn vault and its strategy contract (MUSD Savings Rate / sMUSD), plus totalAssets of the USDC Lending Vault, a Morpho Vault V2 (morphoBTC-mUSDC) supplying the Morpho Blue BTC/mUSDC market.',
  mezo: { tvl },
};
