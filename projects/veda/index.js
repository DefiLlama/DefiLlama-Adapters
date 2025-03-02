const sdk = require("@defillama/sdk");
const { legacyVaultsEthereum, boringVaultsV0Ethereum } = require("./ethereum_constants");
const { boringVaultsV0Berachain } = require("./berachain_constants");
const { sumLegacyTvl, sumBoringTvl } = require("./helper_methods");

async function ethereum_tvl(api) {
  const block = await api.getBlock()

  // Legacy vaults
  const activeLegacyVaultAddresses = filterActiveLegacyVaults(legacyVaultsEthereum, block);
  if (activeLegacyVaultAddresses.length > 0) {
    await sumLegacyTvl({
      api,
      vaults: activeLegacyVaultAddresses,
      ownersToDedupe: [...legacyVaultsEthereum, ...boringVaultsV0Ethereum].filter(v => v.id),
    });
  }

  // Boring vaults V0
  const activeBoringVaults = filterActiveBoringVaults(boringVaultsV0Ethereum, block);
  if (activeBoringVaults.length > 0) {
    await sumBoringTvl({
      api,
      vaults: activeBoringVaults,
      ownersToDedupe: [...legacyVaultsEthereum, ...boringVaultsV0Ethereum].filter(v => v.id),
    });
  }

  return api.getBalances();
}

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
  ["ethereum"]: { tvl: ethereum_tvl },
  ["berachain"]: { tvl: berachain_tvl }
};
