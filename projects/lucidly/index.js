const sdk = require("@defillama/sdk");

const { boringVaultsV0Ethereum } = require("./ethereumConstants");
const { boringVaultsV0Arbitrum } = require("./arbitrumConstants");
const { boringVaultsV0Base } = require("./baseConstants");
const { sumLegacyTvl, sumBoringTvl } = require("./helperMethods");

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

async function legacyTvl(api) {
    const registryAddress = '0x3C2A24c9296eC8B1fdb8039C937DaC7CBca3976c';
    const pools = await api.call({
        abi: 'function getPoolAddresses() view returns (address[])',
        target: registryAddress,
    });

    const tokens = await api.fetchList({ lengthAbi: 'numTokens', itemAbi: 'tokens', calls: pools, groupedByInput: true, })
    const ownerTokens = pools.map((v, i) => [tokens[i], v]);
    const balances = await api.sumTokens({ ownerTokens });
    const numericBalances = {};
    for (const [token, amount] of Object.entries(balances)) {
        numericBalances[token] = Number(amount);
    }
    return numericBalances;
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
    ["ethereum"]: {
        tvl: sdk.util.sumChainTvls([
            (api) => chainTvl(api, boringVaultsV0Ethereum),
            (api) => legacyTvl(api)
        ])
    },
    ["arbitrum"]: { tvl: (api) => chainTvl(api, boringVaultsV0Arbitrum) },
    ["base"]: { tvl: (api) => chainTvl(api, boringVaultsV0Base) },
};
