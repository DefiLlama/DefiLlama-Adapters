const { boringVaultsV0Berachain } = require("./berachain_constants");
const { sumBoringTvl } = require("./helper_methods");

// Returns list of vault addresses that are deployed based on their start block
function filterActiveLegacyVaults(vaults, blockHeight) {
  return vaults
    .filter((vault) => vault.startBlock <= blockHeight)
    .map((vault) => vault.id)
    .filter(Boolean);
}

// Returns a list of active boring vault objects
function filterActiveBoringVaults(vaults, blockHeight) {
  return vaults
    .filter((vault) => vault.startBlock <= blockHeight && vault.vault)
    .map((vault) => ({
      id: vault.vault,
      lens: vault.lens,
      accountant: vault.accountant,
      teller: vault.teller
    }));
}


async function berachain_tvl(api) {
  const block = await api.getBlock()

  const activeBoringVaults = filterActiveBoringVaults(boringVaultsV0Berachain, block);
  if (activeBoringVaults.length > 0) {
    await sumBoringTvl({
      api,
      vaults: activeBoringVaults,
      ownersToDedupe: [...boringVaultsV0Berachain].filter(v => v.id),
    });
  }
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  start: 1710745200,
  doublecounted: true,
  ["berachain"]: { tvl: berachain_tvl }
};
