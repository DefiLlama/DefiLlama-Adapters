const contracts = require('./contracts');
const { getLogs } = require('../helper/cache/getLogs')

async function getAeraVaults(api) {
    const vaults = [];
    await Promise.all(Object.values(contracts[api.chain].vaultFactories).map(async (factory) => {
        const logs = await getLogs({
            // skipCache: true,
            api,
            target: factory.address,
            topic: factory.topic,
            topics: factory.topics,
            eventAbi: factory.eventAbi,
            fromBlock: factory.fromBlock,
            onlyArgs: true,
        });
        vaults.push(...logs.map(x => x.vault))
    }));
    return vaults;
}

async function getMorphoVaults(api) {
    const vaults = [];
    await Promise.all(contracts[api.chain].metaMorphoFactories.map(async (factory) => {
    const logs = await getLogs({
            // skipCache: true,
            api,
            target: factory.address,
            topic: factory.topic,
            topics: factory.topics,
            eventAbi: factory.eventAbi,
            fromBlock: factory.fromBlock,
            onlyArgs: true,
        });
        vaults.push(...logs.map(x => x.metaMorpho));
    }));
    return vaults;
}

async function sumErc4626Balances({api, owners, vaults}) {
    // vaults = vaults.filter(vault => vault !== '0xc582F04d8a82795aa2Ff9c8bb4c1c889fe7b754e');
    const assets = await api.multiCall({
        calls: vaults.map(vault => ({
          target: vault,
          params: []
        })),
        abi: 'address:asset',
        withMetadata: true,
      });

    const vaultsToAssets = vaults.reduce((acc, vault, index) => {
        acc[vault] = assets[index].output;
        return acc;
    }, {});

    const vaultsAndOwners = vaults.flatMap((vault, index) => 
        owners.map(owner => ({
            target: vault,
            params: [owner],
        })));
    
    const shares = await api.multiCall({
        calls: vaultsAndOwners,
        abi: 'function balanceOf(address) view returns (uint256)',
    });
    const balances = await api.multiCall({
        calls: shares.map((share, index) => ({
            target: vaultsAndOwners[index].target,
            params: [share],
        })),
        abi: 'function convertToAssets(uint256) view returns (uint256)',
    });
    const assetsForBalances = vaultsAndOwners.map((vault) => (vaultsToAssets[vault.target]));
    await api.addTokens(
        assetsForBalances,
        balances
    );
}

module.exports = {
    getAeraVaults,
    getMorphoVaults,
    sumErc4626Balances,
};