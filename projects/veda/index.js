const sdk = require("@defillama/sdk");

const { legacyVaultsEthereum, boringVaultsV0Ethereum } = require("./ethereum_constants");
const { boringVaultsV0Berachain } = require("./berachain_constants");
const { boringVaultsV0Arbitrum } = require("./arbitrum_constants");
const { boringVaultsV0Base } = require("./base_constants");
const { boringVaultsV0Bnb } = require("./bnb_constants");
const { boringVaultsV0Bob } = require("./bob_constants");
const { boringVaultsV0Sonic } = require("./sonic_constants");
const { sumLegacyTvl, sumBoringTvl } = require("./helper_methods");

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

async function chainTvl(api, boringVaults, legacyVaults = []) {
  const block = await api.getBlock()
  
  const activeBoringVaults = filterActiveBoringVaults(boringVaults, block);
  const activeLegacyVaultAddresses = legacyVaults.length > 0 
    ? filterActiveLegacyVaults(legacyVaults, block)
    : [];

  const allVaults = [...(legacyVaults || []), ...activeBoringVaults].filter(v => v.id);

  if (activeLegacyVaultAddresses.length > 0) {
    await sumLegacyTvl({
      api,
      vaults: activeLegacyVaultAddresses,
      ownersToDedupe: allVaults,
    });
  }

  if (activeBoringVaults.length > 0) {
    await sumBoringTvl({
      api,
      vaults: activeBoringVaults,
      ownersToDedupe: allVaults,
    });
  }

  return api.getBalances();
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  start: 1710745200,
  doublecounted: true,
  ["ethereum"]: { tvl: (api) => chainTvl(api, boringVaultsV0Ethereum, legacyVaultsEthereum) },
  ["berachain"]: { tvl: (api) => chainTvl(api, boringVaultsV0Berachain) },
  ["arbitrum"]: { tvl: (api) => chainTvl(api, boringVaultsV0Arbitrum) },
  ["base"]: { tvl: (api) => chainTvl(api, boringVaultsV0Base) },
  ["bsc"]: { tvl: (api) => chainTvl(api, boringVaultsV0Bnb) },
  ["bob"]: { tvl: (api) => chainTvl(api, boringVaultsV0Bob) },
  ["sonic"]: { tvl: (api) => chainTvl(api, boringVaultsV0Sonic) }
};
