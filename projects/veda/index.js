const sdk = require("@defillama/sdk");
const { legacyVaults, boringVaultsV0 } = require("./constants");

async function ethereum_tvl(api) {
  const block  = await api.getBlock()
  const balances = {};

  // Legacy vaults
  const legacyBalances = await api.multiCall({
    abi: "uint256:totalAssets",
    calls: filterActiveLegacyVaults(legacyVaults, block),
  });

  const legacyAssets = legacyVaults.map((vault) => vault.baseAsset);

  legacyAssets.forEach((asset, idx) => {
    sdk.util.sumSingleBalance(balances, asset, legacyBalances[idx]);
  });

  // Boring vaults V0
  const activeBoringVaults = filterActiveBoringVaults(boringVaultsV0, block);
  const boringCalls = activeBoringVaults.map((vault) => ({
    target: vault.lens,
    params: [vault.vault, vault.accountant],
  }));

  const boringBalances = await api.multiCall({
    abi: "function totalAssets(address boringVault, address accountant) view returns (address asset, uint256 assets)",
    calls: boringCalls,
  });
  const boringV0Assets = activeBoringVaults.map((vault) => vault.baseAsset);

  boringV0Assets.forEach((asset, idx) => {
    sdk.util.sumSingleBalance(balances, asset, boringBalances[idx][1]);
  });

  return balances;
}

// Returns list of vault addresses that are deployed based on their start block
function filterActiveLegacyVaults(vaults, blockHeight) {
  return vaults
    .filter((vault) => vault.startBlock <= blockHeight)
    .map((vault) => vault.id);
}

// Returns a dictionary of vault objects that are deployed based on their start block
function filterActiveBoringVaults(vaults, blockHeight) {
  return vaults
    .filter((vault) => vault.startBlock <= blockHeight)
    .map((vault) => vault);
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  start: 1710745200,
  ["ethereum"]: { tvl: ethereum_tvl }
};
