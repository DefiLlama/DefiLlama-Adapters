const { sumLegacyTvl, sumBoringTvl, filterActiveBoringVaults, filterActiveLegacyVaults } = require("../helper/boringVault");

const { legacyVaultsEthereum, boringVaultsV0Ethereum } = require("./ethereum_constants");
const { boringVaultsV0Berachain } = require("./berachain_constants");
const { boringVaultsV0Arbitrum } = require("./arbitrum_constants");
const { boringVaultsV0Base } = require("./base_constants");
const { boringVaultsV0Bnb } = require("./bnb_constants");
const { boringVaultsV0Bob } = require("./bob_constants");
const { boringVaultsV0Sonic } = require("./sonic_constants");
const { boringVaultsV0Scroll } = require("./scroll_constants");
const { boringVaultsV0Hyperevm } = require("./hyperevm_constants");
const { boringVaultsV0Plasma } = require("./plasma_constants");

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
  ["sonic"]: { tvl: (api) => chainTvl(api, boringVaultsV0Sonic) },
  ["scroll"]: { tvl: (api) => chainTvl(api, boringVaultsV0Scroll) },
  ["hyperliquid"]: { tvl: (api) => chainTvl(api, boringVaultsV0Hyperevm) },
  ["plasma"]: { tvl: (api) => chainTvl(api, boringVaultsV0Plasma) }
};
