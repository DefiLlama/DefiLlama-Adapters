const sdk = require("@defillama/sdk");

const { boringVaultsEthereum } = require("./ethereum_constants");
const { boringVaultsV0Fuse } = require("./fuse_constants");
const { sumBoringTvl } = require("./helper_methods");

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

async function chainTvl(api, boringVaults) {
  const block = await api.getBlock()

  const activeBoringVaults = filterActiveBoringVaults(boringVaults, block);

  const allVaults = [...activeBoringVaults].filter(v => v.id);

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
  start: 1749279179,
  doublecounted: true,
  ["ethereum"]: { tvl: (api) => chainTvl(api, boringVaultsEthereum) },
  ["fuse"]: { tvl: (api) => chainTvl(api, boringVaultsV0Fuse) },
};
